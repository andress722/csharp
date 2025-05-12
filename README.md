# csharp

FinanceiroApi/
│
├── Controllers/
│   └── PagamentosController.cs
│
├── Data/
│   └── FinanceiroContext.cs
│
├── Models/
│   └── Pagamento.cs
│
├── Program.cs
└── FinanceiroApi.csproj

using System;
using System.Data.SqlClient;

class Program
{
    static void Main()
    {
        // Connection string de exemplo — ajuste para seu servidor, banco, usuário e senha
        string connectionString = "Server=localhost;Database=NomeDoSeuBanco;User Id=seuUsuario;Password=suaSenha;";
        
        // Cria a conexão
        using (SqlConnection connection = new SqlConnection(connectionString))
        {
            try
            {
                connection.Open(); // Tenta abrir a conexão
                Console.WriteLine("Conexão bem-sucedida!");

                // Aqui você pode executar comandos, fazer consultas, etc.
            }
            catch (Exception ex)
            {
                Console.WriteLine("Erro ao conectar: " + ex.Message);
            }
        } // A conexão é automaticamente fechada aqui (por causa do using)
    }
}


PayController

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApiFinancer.Data;
using WebApiFinancer.Models;

namespace WebApiFinancer.Controllers
{


    [ApiController]
    [Route("api/[controller]")]
    public class PagamentosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public PagamentosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        
        public async Task<ActionResult<IEnumerable<Pagamento>>> GetPagamentos()
        {
            var pagamentos = await _context.Pagamentos.ToListAsync();
            return Ok(pagamentos);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Pagamento>> GetPayId(int id)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);
            if (pagamento == null)
            {
                return NotFound();
            }
            return Ok(pagamento);
        }
        [HttpPost]
        public ActionResult<Pagamento> PostPagamento(Pagamento pagamento)
        {
            _context.Pagamentos.Add(pagamento);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetPayId), new { id = pagamento.Id }, pagamento);
        }
        [HttpGet("saldo")]
        public async Task<ActionResult<decimal>> GetSaldo()
        {
            var totalPagamentos = await _context.Pagamentos.SumAsync(p => p.Valor);
            return Ok(-totalPagamentos);

        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPagamento(int id, Pagamento pagamento)
        {
            if (id != pagamento.Id)
            {
                return BadRequest();
            }

                _context.Entry(pagamento).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
           
        }

    }
    }



MiddlewareExcption

namespace WebApiFinancer.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;


        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);

            }
            catch (Exception)
            {
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync("{\"message\":\"Erro interno. Tente novamente mais tarde.\"}");
            }
        }
    }
}



modelPagamento

namespace WebApiFinancer.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }
        public bool Pago { get; set; }

    }
}



// App.tsx
import React from 'react';
import Pagamentos from './components/Pagamentos';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        Dashboard Financeiro
      </h1>
      <Pagamentos />
    </div>
  );
}

// src/types/Pagamento.ts
export interface Pagamento {
  id: number;
  descricao: string;
  valor: number;
  data: string;
}

// src/components/Pagamentos.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagamento } from '../types/Pagamento';
import NovoPagamentoForm from './NovoPagamentoForm';

const API_URL = 'https://localhost:5001/api/pagamentos';

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [saldo, setSaldo] = useState<number>(0);

  const carregarDados = async () => {
    const resPagamentos = await axios.get<Pagamento[]>(API_URL);
    const resSaldo = await axios.get<number>(`${API_URL}/saldo`);
    setPagamentos(resPagamentos.data);
    setSaldo(resSaldo.data);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Saldo: <span className="text-green-600 font-bold">R$ {saldo.toFixed(2)}</span>
      </h2>

      <NovoPagamentoForm onAdd={carregarDados} />

      <ul className="mt-6">
        {pagamentos.map((p) => (
          <li key={p.id} className="flex justify-between border-b py-2">
            <div>
              <p className="font-medium">{p.descricao}</p>
              <p className="text-sm text-gray-500">{new Date(p.data).toLocaleDateString()}</p>
            </div>
            <p className="text-red-500 font-semibold">- R$ {p.valor.toFixed(2)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// src/components/NovoPagamentoForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Pagamento } from '../types/Pagamento';

const API_URL = 'https://localhost:5001/api/pagamentos';

interface Props {
  onAdd: () => void;
}

export default function NovoPagamentoForm({ onAdd }: Props) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.post<Pagamento>(API_URL, {
      descricao,
      valor: parseFloat(valor),
      data,
    });

    setDescricao('');
    setValor('');
    setData('');
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <input
        type="text"
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Valor"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="border p-2 rounded"
        step="0.01"
        required
      />
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <button
        type="submit"
        className="col-span-1 md:col-span-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Adicionar Pagamento
      </button>
    </form>
  );
}


 No arquivo src/index.css, adicione:
css
Copiar
Editar
@tailwind base;
@tailwind components;
@tailwind utilities;

Configure o Tailwind (em tailwind.config.js):
js
Copiar
Editar
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

Instale o TailwindCSS:
bash
Copiar
Editar
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


Instale o TailwindCSS:
bash
Copiar
Editar
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


  npm install axios
