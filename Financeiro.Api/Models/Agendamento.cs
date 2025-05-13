
namespace Financeiro.Api.Models;

public class Agendamento
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public DateTime DataAgendada { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
