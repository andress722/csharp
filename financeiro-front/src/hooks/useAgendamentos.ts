
import { useEffect, useState } from "react";
import axios from "axios";

export interface Agendamento {
  id?: number;
  descricao: string;
  valor: number;
  dataAgendada: string;
  criadoEm?: string;
}

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [totalGeral, setTotalGeral] = useState<number>(0);
  const [totalProximos6Dias, setTotalProximos6Dias] = useState<number>(0);
  const [totaisPorData, setTotaisPorData] = useState<Record<string, number>>({});

  const fetchAgendamentos = async () => {
    const res = await axios.get("http://localhost:5000/api/agendamento");
    setAgendamentos(res.data.agendamentos);
    setTotalGeral(res.data.totalGeral);
    setTotalProximos6Dias(res.data.totalProximos6Dias);
  };

  const fetchTotaisPorData = async () => {
    const res = await axios.get("http://localhost:5000/api/agendamento/totais-por-data");
    setTotaisPorData(res.data);
  };

  const adicionarAgendamento = async (novo: Agendamento) => {
    await axios.post("http://localhost:5000/api/agendamento", novo);
    await fetchAgendamentos();
    await fetchTotaisPorData();
  };

  useEffect(() => {
    fetchAgendamentos();
    fetchTotaisPorData();
  }, []);

  return {
    agendamentos,
    totalGeral,
    totalProximos6Dias,
    totaisPorData,
    adicionarAgendamento,
  };
}
