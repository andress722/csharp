
using Financeiro.Api.Data;
using Financeiro.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Financeiro.Api.Services;

public class AgendamentoService
{
    private readonly AppDbContext _context;

    public AgendamentoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Agendamento>> GetAllAsync() =>
        await _context.Agendamentos.ToListAsync();

    public async Task<decimal> GetTotalAsync() =>
        await _context.Agendamentos.SumAsync(a => a.Valor);

    public async Task<decimal> GetTotalProximosDiasAsync(int dias)
    {
        var hoje = DateTime.Today;
        var limite = hoje.AddDays(dias);
        return await _context.Agendamentos
            .Where(a => a.DataAgendada >= hoje && a.DataAgendada <= limite)
            .SumAsync(a => a.Valor);
    }

    public async Task<Dictionary<DateTime, decimal>> GetTotaisPorDataAsync()
    {
        return await _context.Agendamentos
            .GroupBy(a => a.DataAgendada)
            .Select(g => new { Data = g.Key, Total = g.Sum(x => x.Valor) })
            .ToDictionaryAsync(x => x.Data, x => x.Total);
    }

    public async Task<Agendamento> CreateAsync(Agendamento agendamento)
    {
        _context.Agendamentos.Add(agendamento);
        await _context.SaveChangesAsync();
        return agendamento;
    }
}
