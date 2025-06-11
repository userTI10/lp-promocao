'use client'
import Image from 'next/image'
import { useState, useEffect } from "react";
import moment from 'moment';
import { z } from "zod";
import { toast } from 'react-toastify';
import Banner1 from '@/assets/Banner1.jpg';
import Reagras from '@/Components/Regras';
import "moment/locale/pt-br";
import * as XLSX from 'xlsx';
 

const formSchema = z.object({
  nome: z.string().min(8, 'Nome deve ter no mínimo 8 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').regex(/^\d+$/, 'CPF deve conter apenas números'),
  email: z.string().email('Email inválido').regex(/^[^@]+@[^@]+\.(com|com\.br)$/, 'Email deve terminar com .com ou .com.br'),
});

export default function Home() {

  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  // MENSAGEM DE SUCESSO
  const successNotify = () => toast.success("Cadastro realizado com sucesso!", {
    position: "top-right",
    autoClose: 3000,
    style: {
      background: '#fff',
      color: '#22c55e'
    }
  });
  
  // MESSAGEM DE ERRO 
  const errorNotify = (message) => toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    style: {
      background: '#fff',
      color: '#ef4444'
    }
  });

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    ddd: '',
    celular: '',
    estado: '',
    cidade: '',
    clienteTouti: '',
    escolhahorario: '',
    data: moment().format("YYYY/MM/DD hh:mm:ss"),
    aceitaTermos: false,
    saurus:'',
    endereco:'',
  });

  // Adicionar novo estado para erros
  const [errors, setErrors] = useState({});

  // Adicionar função para verificar se o formulário está válido
  const isFormValid = () => {
    const hasNoErrors = Object.values(errors).every(error => error === '');
    const requiredFields = 
      formData.nome.trim() !== '' && 
      formData.email.trim() !== '' && 
      formData.cpf.trim() !== '' &&  // Add CPF validation
      formData.escolhahorario !== '' && 
      formData.aceitaTermos === true;
    
    return hasNoErrors && requiredFields;
  };

  //CHECA SE EXISTE EMAIL OU CPF NO BANCO
  const checkExistingUser = async (email, cpf) => {
    try {
      const response = await fetch('/api/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, cpf }),
      });
      return await response.json();
    } catch (error) {
      return { error: true, message: 'Erro ao verificar dados' };
    }
  };

  //CUPOM GENERATE
  const generateCupom = () => {
    return 'TOUTI - ' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // SUBMIT DO FORMULARIO 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const cupom = generateCupom();
      const dataFormatada = moment().format("YYYY-MM-DD HH:mm:ss");
      // Verificar se usuário já existe
      const checkResult = await checkExistingUser(formData.email, formData.cpf);
      
      if (checkResult.exists) {
        errorNotify(checkResult.message);
        return;
      }

      const horariosResponse = await fetch('/api/check-horario', { method: 'GET' });
      const horariosData = await horariosResponse.json();

      if (horariosData.success) {
        const horarios = horariosData.horariosOcupados || {};

        if (horarios[formData.escolhahorario]) {
          errorNotify('Esse horário já foi preenchido. Por favor, escolha outro.');
          return;
        }
      } else {
        errorNotify('Não foi possível verificar os horários disponíveis.');
        return;
      }

      // Se não existe, prossegue com o cadastro
      const response = await fetch('/api/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          data: dataFormatada,
          cupom: cupom
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }
  
      const result = await response.json();
  
      if (result.success) { 

        console.log('Dados para envio de email:', {
          nome: formData.nome,
          email: formData.email,
          escolhahorario: formData.escolhahorario,
          cupom: cupom
        });

        const emailResponse = await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            escolhahorario: formData.escolhahorario,
            cupom: cupom,
            endereco: formData.endereco,
            saurus: formData.saurus,
            cpf: formData.cpf,
            cidade: formData.cidade,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log('Resposta do envio de email:', emailResult);
        

        successNotify();

        // Atualizar horários ocupados após cadastro bem-sucedido
        const horariosResponse = await fetch('/api/check-horario');
        const horariosData = await horariosResponse.json();
        if (horariosData.success) {
          setHorariosOcupados(horariosData.horariosOcupados);
        }

        setFormData({
          nome: '',
          cpf: '',
          email: '',
          ddd: '',
          celular: '',
          estado: '',
          cidade: '',
          clienteTouti: '',
          escolhahorario: '',
          data: moment().format("YYYY-MM-DD HH:mm:ss"),
          aceitaTermos: false,
          saurus: '',
          endereco: '',
        });
        
      } else {
        errorNotify(result.error || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      console.error('Erro:', error);
      errorNotify('Erro ao conectar com o servidor');
    }
};

  // Atualizar handleChange para incluir validação
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (name === 'cpf') {
      // Remove qualquer caractere que não seja número
      const numbersOnly = value.replace(/\D/g, '').slice(0,11);
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
    } else if(name === 'cidade' && value) {
      const cidadeSelecionada = cidades.find(cidade => cidade.nome === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        saurus: cidadeSelecionada ? cidadeSelecionada.saurus : '',
        endereco: cidadeSelecionada ? cidadeSelecionada.endereco : ''
      }));
    }
    
    else if (name === 'escolhahorario' && value) {
      const allDays = getNextFiveDays();
      const selectedHorario = allDays.flatMap(day => day.horarios).find(h => h.label === value);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        saurus: selectedHorario ? selectedHorario.saurus : ''
      }));
    }else if (name === 'nome') {
      const nomeOnly = value.replace(/[^a-záàâãéèêíïóôõöúçñ ]/gi, '');
      setFormData(prev => ({
        ...prev,
        [name]: nomeOnly
      }));
    } else if(name === 'ddd') {
      const dddOnly = value.replace(/\D/g, '').slice(0, 2);
      setFormData(prev => ({
        ...prev,
        [name]: dddOnly
      }));
    } else if(name === 'celular') {
      const celularOnly = value.replace(/\D/g, '').slice(0, 9);
      setFormData(prev => ({
        ...prev,
        [name]: celularOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Validar campo se for nome, cpf ou email
    if (['nome', 'cpf', 'email'].includes(name)) {
      try {
        if (name === 'cpf') {
          formSchema.shape[name].parse(value.replace(/\D/g, '').replace(/(\d{11})\d+?$/))
        } else if (name === 'nome') {
          formSchema.shape[name].parse(value.replace(/[^a-záàâãéèêíïóôõöúçñ ]/gi, ''));
        } 
        else {
          formSchema.shape[name].parse(value);
        }
        setErrors(prev => ({ ...prev, [name]: '' }));
      } catch (error) {
        setErrors(prev => ({ ...prev, [name]: error.errors[0].message }));
      }
    }
  };

  const [horariosOcupados, setHorariosOcupados] = useState({});
  // const [loadingHorarios, setLoadingHorarios] = useState(true);

  // useEffect(() => {
  //   const fetchHorariosOcupados = async () => {
  //     try {
  //       setLoadingHorarios(true);
  //       const response = await fetch('/api/check-horario');
  //       const data = await response.json();

  //       if (data.success) {
  //         console.log('Horários ocupados:', data.horariosOcupados);
  //         setHorariosOcupados(data.horariosOcupados);
  //       }
  //     } catch (error) {
  //       console.error('Erro ao buscar horários:', error);
  //     } finally {
  //       setLoadingHorarios(false);
  //     }
  //   };

  //   fetchHorariosOcupados();
  //   const interval = setInterval(fetchHorariosOcupados, 10000);
  //   return () => clearInterval(interval);
  // }, []);


  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

// Adicionar função para buscar estados
useEffect(() => {
    const loadEstados = async () => {
      try {
        const response = await fetch('/data/lojas.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets['lojas']; // Nome da planilha específica
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Extrai estados únicos do arquivo Excel
        const estadosUnicos = [...new Set(data.map(row => row.estado))];
        
        // Formata os estados no formato necessário
        const estadosFormatados = estadosUnicos
          .filter(estado => estado) // Remove valores vazios ou undefined
          .map((estado, index) => ({
            id: index + 1,
            sigla: estado.toUpperCase()
          }));
        
        setEstados(estadosFormatados);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        setEstados([]);
      }
    };
  
    loadEstados();
  }, []);

useEffect(() => {
  const loadCidades = async () => {
    if (formData.estado) {
      try {
        const response = await fetch('/data/lojas.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets['lojas']; // Nome da planilha específica
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        // Filtra as cidades do estado selecionado e remove duplicatas
        const cidadesDoEstado = data
          .filter(row => row.estado?.toUpperCase() === formData.estado)
          .reduce((unique, row) => {
            const cidadeExistente = unique.find(item => item.nome === row.cidade);
            if (!cidadeExistente) {
              unique.push({
                id: unique.length + 1,
                nome: row.loja,
                endereco: row.endereco,
                referencia: row.referencia,
                cidade: row.cidade,
                saurus: row.saurus
              });
            }
            return unique;
          }, []);
        
        setCidades(cidadesDoEstado);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        setCidades([]);
      }
    } else {
      setCidades([]);
    }
  };

  loadCidades();
}, [formData.estado]);

const getNextFiveDays = () => {
  const days = [];
  
  if (!formData.cidade) {
    return days;
  }

  const horarios = [
    { value: 'horario1', label: '10h - 13h' },
    { value: 'horario2', label: '13h - 18h' },
    { value: 'horario3', label: '18h - 22h' }
  ];

  // Encontrar o shopping selecionado para pegar o saurus
  const selectedShopping = cidades.find(cidade => cidade.nome === formData.cidade);

  for (let i = 1; i <= 5; i++) {
    const day = moment().add(i, 'days');
    days.push({
      date: day.format('DD/MM'),
      local: formData.cidade,
      horarios: horarios.map(horario => ({
        value: `${day.format('YYYY-MM-DD')}_${formData.cidade}_${horario.value}`,
        label: `${formData.cidade} - ${day.format('DD/MM')} - ${horario.label}`,
        saurus: selectedShopping ? selectedShopping.saurus : ''
      }))
    });
  }

  return days;
};



  return (
    <>
    <div className='box_form container p-4 rounded-md sm:p-6 md:p-8 rounded-md w-[21.875rem] sm:w-[35rem] lg:w-[50rem] mx-auto' >
      <div className='mb-4 flex mx-auto justify-center w-full rounded-md'>
        <Image 
          src={Banner1}
          alt="imagem do produto"
          width={736}
          height={386}
          className='imgBanner block img_banner'
        />
      </div>

      {/* AQUI VEM O CODIGO DEBUG */}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block mb-2">Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.nome ? 'border-red-500' : ''}`}
            required
            placeholder='Nome e Sobrenome'
          />
          {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
        </div>

        <div>
          <label className="block mb-2">CPF:</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.cpf ? 'border-red-500' : ''}`}
            required 
            placeholder='Somente números'
          />
          {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
        </div>

        <div>
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
            required
            placeholder='e-mail'
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="flex gap-4">
          <div className="w-1/4">
            <label className="block mb-2">DDD:</label>
            <input
              type="text"
              name="ddd"
              value={formData.ddd}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              maxLength="2"
              required
              placeholder='DDD'
            />
          </div>
          <div className="w-3/4">
            <label className="block mb-2">Celular:</label>
            <input
              type="text"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required 
              placeholder='Somente números'
            />
          </div>
        </div>

        <div className="flex gap-4" >
          <div className="w-1/4">
            <label className="block mb-2">Estado:</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="p-2 border rounded w-full"
              required 
              placeholder="UF"
            >
              <option value="">UF</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.sigla}>
                  {estado.sigla}
                </option>
              ))}
            </select>

          </div>
          <div className="w-3/4">
            <label className="block mb-2">Cidade:</label>
            <select
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.estado}
            >
              <option value="">Selecione uma cidade</option>
              {cidades.map(cidade => (
                <option key={cidade.id} value={cidade.nome}>
                  {cidade.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2">Escolha a data e horário:</label>
          <select
            name="escolhahorario"
            value={formData.escolhahorario}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecione um horário</option>
            {getNextFiveDays().flatMap(day => 
              day.horarios.map(horario => {
                const isDisabled = (horariosOcupados[horario.label] || 0) >= 2;
                return (
                  <option 
                    key={horario.value} 
                    value={horario.label}
                    disabled={isDisabled}
                  >
                    {horario.label}
                    {isDisabled ? ' (Esgotado)' : ''}
                    
                  </option>
                );
              })
            )}
          </select>
        </div>

        <div>
          <label className="block mb-2">
            Você já comprou na Touti?
          </label>
          <div className="space-x-4">
            <label>
              <input
                type="radio"
                name="clienteTouti"
                value="sim"
                checked={formData.clienteTouti === 'sim'}
                onChange={handleChange}
              /> Sim
            </label>
            <label>
              <input
                type="radio"
                name="clienteTouti"
                value="nao"
                checked={formData.clienteTouti === 'nao'}
                onChange={handleChange}
              /> Não
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="aceitaTermos"
              checked={formData.aceitaTermos}
              onChange={handleChange}
              required
            />
            <span>Aceito os termos e condições</span>
          </label>
        </div>

        <button
          type="submit"
          className={`w-full p-2 rounded ${
            isFormValid()
              ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
          }`}
          disabled={!isFormValid()}
        >
          Cadastrar
        </button>
      </form>
    </div>
      <Reagras/>
    </>
  );
}
