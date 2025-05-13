
using Financeiro.Api.Models;
using Financeiro.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Financeiro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgendamentoController : ControllerBase
{
    private readonly AgendamentoService _service;

    public AgendamentoController(AgendamentoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var lista = await _service.GetAllAsync();
        var total = await _service.GetTotalAsync();
        var totalProximos6Dias = await _service.GetTotalProximosDiasAsync(6);
        return Ok(new { agendamentos = lista, totalGeral = total, totalProximos6Dias });
    }

    [HttpPost]
    public async Task<IActionResult> Post(Agendamento agendamento)
    {
        var novo = await _service.CreateAsync(agendamento);
        return CreatedAtAction(nameof(Get), new { id = novo.Id }, novo);
    }

    [HttpGet("totais-por-data")]
    public async Task<IActionResult> GetTotaisPorData()
    {
        var totais = await _service.GetTotaisPorDataAsync();
        return Ok(totais);
    }
}
