
import React, { useState } from "react";
import { useAgendamentos, Agendamento } from "./hooks/useAgendamentos";

function App() {
  const { agendamentos, totalGeral, totalProximos6Dias, totaisPorData, adicionarAgendamento } = useAgendamentos();
  const [form, setForm] = useState<Agendamento>({ descricao: "", valor: 0, dataAgendada: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.dataAgendada || !form.valor) return;
    await adicionarAgendamento(form);
    setForm({ descricao: "", valor: 0, dataAgendada: "" });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1>Agendamentos de Pagamento</h1>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} className="w-full p-2 border" />
        <input name="valor" type="number" placeholder="Valor" value={form.valor} onChange={handleChange} className="w-full p-2 border" />
        <input name="dataAgendada" type="date" value={form.dataAgendada} onChange={handleChange} className="w-full p-2 border" />
        <button type="submit" className="p-2 bg-blue-500 text-white w-full">Agendar Pagamento</button>
      </form>

      <ul>
        {agendamentos.map((ag) => (
          <li key={ag.id}>
            {ag.descricao} - R$ {ag.valor.toFixed(2)} - {new Date(ag.dataAgendada).toLocaleDateString()}
          </li>
        ))}
      </ul>

      <h2>Total Geral Agendado: R$ {totalGeral.toFixed(2)}</h2>
      <h3>Total nos Próximos 6 dias: R$ {totalProximos6Dias.toFixed(2)}</h3>

      <h3>Totais por Data Agendada:</h3>
      <ul>
        {Object.entries(totaisPorData).map(([data, total]) => (
          <li key={data}>
            📅 {new Date(data).toLocaleDateString()} — Total: R$ {total.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
