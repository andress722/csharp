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

Projeto API Financeira - ASP.NET Core + React + TypeScript
1. Backend - ASP.NET Core (C#)
Program.cs

using FinanceiroApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<FinanceiroContext>(opt =>
    opt.UseInMemoryDatabase("FinanceiroDb"));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();

FinanceiroContext.cs

using Microsoft.EntityFrameworkCore;
using FinanceiroApi.Models;

namespace FinanceiroApi.Data
{
    public class FinanceiroContext : DbContext
    {
        public FinanceiroContext(DbContextOptions<FinanceiroContext> options) : base(options) { }
        public DbSet<Pagamento> Pagamentos { get; set; }
    }
}

Pagamento.cs

namespace FinanceiroApi.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }
    }
}

PagamentosController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanceiroApi.Data;
using FinanceiroApi.Models;

namespace FinanceiroApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagamentosController : ControllerBase
    {
        private readonly FinanceiroContext _context;

        public PagamentosController(FinanceiroContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pagamento>>> GetTodos()
        {
            return await _context.Pagamentos.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pagamento>> GetPorId(int id)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);
            return pagamento is null ? NotFound() : Ok(pagamento);
        }

        [HttpGet("saldo")]
        public async Task<ActionResult<decimal>> GetSaldo()
        {
            var total = await _context.Pagamentos.SumAsync(p => p.Valor);
            return Ok(-total);
        }

        [HttpPost]
        public async Task<ActionResult<Pagamento>> Criar(Pagamento pagamento)
        {
            _context.Pagamentos.Add(pagamento);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPorId), new { id = pagamento.Id }, pagamento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, Pagamento pagamento)
        {
            if (id != pagamento.Id) return BadRequest();
            _context.Entry(pagamento).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var pagamento = await _context.Pagamentos.FindAsync(id);
            if (pagamento == null) return NotFound();
            _context.Pagamentos.Remove(pagamento);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

2. Frontend - React + TypeScript
App.tsx

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

types/Pagamento.ts

export interface Pagamento {
  id: number;
  descricao: string;
  valor: number;
  data: string;
}

components/Pagamentos.tsx

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

components/NovoPagamentoForm.tsx

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
