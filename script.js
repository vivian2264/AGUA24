// ============================================================
// ÁGUA 24
// Inteligência Hídrica e Alerta Preventivo
// ============================================================


// ============================================================
// DADOS INICIAIS DO PROTÓTIPO
// ============================================================

let dados = {

    disponibilidade: 89,

    chuva: 68,

    consumo: 118,

    nivel: 286,

    vazao: 42.8

};


// ============================================================
// HISTÓRICO SIMULADO
// ============================================================

let historicoConsumo = [
    100,
    101,
    98,
    103,
    106,
    108,
    112,
    118
];


let historicoAlertas = [

    {
        icone: "⚠️",
        titulo: "Aumento no consumo",
        horario: "08:10",
        descricao: "Consumo acima do padrão recente."
    },

    {
        icone: "🌧️",
        titulo: "Chuva abaixo da referência",
        horario: "07:45",
        descricao: "Indicador utilizado na simulação."
    },

    {
        icone: "💧",
        titulo: "Disponibilidade monitorada",
        horario: "07:20",
        descricao: "Sistema realizou nova análise."
    }

];


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarInterface();

        criarGrafico();

        atualizarHora();

        mostrarHistoricoAlertas();

    }
);


// ============================================================
// TROCAR DE PÁGINA
// ============================================================

function abrirPagina(pagina, botao) {

    // Esconde todas as páginas

    document
        .querySelectorAll(".pagina")
        .forEach(function (elemento) {

            elemento.classList.remove("ativa");

        });


    // Mostra a página escolhida

    const paginaSelecionada =
        document.getElementById(pagina);


    if (paginaSelecionada) {

        paginaSelecionada.classList.add("ativa");

    }


    // Remove active dos botões

    document
        .querySelectorAll(".menu")
        .forEach(function (elemento) {

            elemento.classList.remove("active");

        });


    // Ativa botão selecionado

    if (botao) {

        botao.classList.add("active");

    }


    // Títulos

    const titulos = {

        painel: "Painel",

        tempo: "Dados em Tempo Real",

        anomalias: "Detector de Anomalias",

        mapa: "Mapa de Risco",

        alertas: "Alertas 24"

    };


    document
        .getElementById("tituloPagina")
        .textContent = titulos[pagina];

}


// ============================================================
// CÁLCULO DO RISCO
// ============================================================

function calcularRisco() {

    let pontuacao = 0;


    // --------------------------------------------------------
    // DISPONIBILIDADE
    // --------------------------------------------------------

    if (dados.disponibilidade < 60) {

        pontuacao += 35;

    }

    else if (dados.disponibilidade < 75) {

        pontuacao += 27;

    }

    else if (dados.disponibilidade < 85) {

        pontuacao += 18;

    }

    else {

        pontuacao += 8;

    }


    // --------------------------------------------------------
    // CHUVA
    // --------------------------------------------------------

    if (dados.chuva < 30) {

        pontuacao += 30;

    }

    else if (dados.chuva < 50) {

        pontuacao += 23;

    }

    else if (dados.chuva < 70) {

        pontuacao += 15;

    }

    else {

        pontuacao += 7;

    }


    // --------------------------------------------------------
    // CONSUMO
    // --------------------------------------------------------

    if (dados.consumo > 140) {

        pontuacao += 35;

    }

    else if (dados.consumo > 125) {

        pontuacao += 30;

    }

    else if (dados.consumo > 110) {

        pontuacao += 24;

    }

    else if (dados.consumo > 100) {

        pontuacao += 12;

    }

    else {

        pontuacao += 5;

    }


    // Garante máximo de 100

    pontuacao =
        Math.min(
            Math.round(pontuacao),
            100
        );


    let nivel;


    if (pontuacao >= 80) {

        nivel = "CRÍTICO";

    }

    else if (pontuacao >= 65) {

        nivel = "ALTO";

    }

    else if (pontuacao >= 45) {

        nivel = "MODERADO";

    }

    else {

        nivel = "BAIXO";

    }


    return {

        pontuacao: pontuacao,

        nivel: nivel

    };

}


// ============================================================
// ATUALIZAR TODA A INTERFACE
// ============================================================

function atualizarInterface() {

    // Cards

    document
        .getElementById("disponibilidade")
        .textContent =
        dados.disponibilidade + "%";


    document
        .getElementById("chuva")
        .textContent =
        dados.chuva + " mm";


    document
        .getElementById("consumo")
        .textContent =
        dados.consumo + "%";


    document
        .getElementById("nivel")
        .textContent =
        dados.nivel + " cm";


    document
        .getElementById("vazao")
        .textContent =
        dados.vazao
            .toFixed(1)
            .replace(".", ",")
        + " m³/s";


    document
        .getElementById("chuvaTempo")
        .textContent =
        dados.chuva + " mm";


    // Calcula risco

    const resultado =
        calcularRisco();


    document
        .getElementById("risco")
        .textContent =
        resultado.nivel;


    document
        .getElementById("pontuacao")
        .textContent =
        resultado.pontuacao + "/100";


    document
        .getElementById("riscoMapa")
        .textContent =
        resultado.nivel;


    atualizarStatus(resultado);

    atualizarMotivos();

    atualizarAnomalia();

    atualizarVariacoes();

    atualizarAlerta(resultado);

}


// ============================================================
// STATUS
// ============================================================

function atualizarStatus(resultado) {

    const status =
        document.getElementById("status");


    if (resultado.nivel === "CRÍTICO") {

        status.textContent =
            "🔴 CRÍTICO";

    }

    else if (resultado.nivel === "ALTO") {

        status.textContent =
            "🟠 RISCO ALTO";

    }

    else if (resultado.nivel === "MODERADO") {

        status.textContent =
            "🟡 ATENÇÃO";

    }

    else {

        status.textContent =
            "🟢 NORMAL";

    }

}


// ============================================================
// MOTIVOS DO RISCO
// ============================================================

function atualizarMotivos() {

    const container =
        document.getElementById("motivos");


    let motivos = [];


    // Disponibilidade

    if (dados.disponibilidade < 85) {

        motivos.push({

            titulo:
                "Disponibilidade abaixo da referência",

            texto:
                "O indicador apresenta valor inferior ao parâmetro utilizado nesta simulação."

        });

    }


    // Chuva

    if (dados.chuva < 60) {

        motivos.push({

            titulo:
                "Chuva abaixo da referência",

            texto:
                "O volume acumulado está abaixo do parâmetro utilizado pelo protótipo."

        });

    }


    // Consumo

    if (dados.consumo > 110) {

        motivos.push({

            titulo:
                "Consumo acima do padrão",

            texto:
                "O consumo atual apresenta aumento em relação ao padrão de referência."

        });

    }


    // Caso nenhum problema

    if (motivos.length === 0) {

        motivos.push({

            titulo:
                "Indicadores dentro da referência",

            texto:
                "Nenhuma alteração relevante foi identificada nesta análise."

        });

    }


    container.innerHTML = "";


    motivos.forEach(
        function (motivo) {

            const elemento =
                document.createElement("div");


            elemento.className =
                "motivo";


            elemento.innerHTML = `

                <b>
                    ${motivo.titulo}
                </b>

                <span>
                    ${motivo.texto}
                </span>

            `;


            container.appendChild(elemento);

        }
    );

}


// ============================================================
// DETECTOR DE ANOMALIAS
// ============================================================

function atualizarAnomalia() {

    const barraAtual =
        document.getElementById("barraAtual");


    const valorAtual =
        document.getElementById("valorAtual");


    const caixa =
        document.getElementById("caixaAnomalia");


    const texto =
        document.getElementById("textoAnomalia");


    // --------------------------------------------------------
    // BARRA
    // --------------------------------------------------------

    let largura =
        (dados.consumo / 150) * 100;


    largura =
        Math.min(
            Math.max(largura, 5),
            100
        );


    barraAtual.style.width =
        largura + "%";


    valorAtual.textContent =
        dados.consumo + "%";


    // --------------------------------------------------------
    // DIFERENÇA
    // --------------------------------------------------------

    let diferenca =
        dados.consumo - 100;


    // --------------------------------------------------------
    // ANOMALIA
    // --------------------------------------------------------

    if (diferenca > 10) {

        caixa.classList.remove("normal");


        texto.textContent =
            "O consumo está " +
            diferenca +
            "% acima do padrão de referência. O sistema recomenda investigar a alteração antes de assumir uma causa.";

    }

    else {

        caixa.classList.add("normal");


        texto.textContent =
            "O consumo permanece próximo do padrão de referência utilizado pelo protótipo.";

    }

}


// ============================================================
// VARIAÇÕES DOS CARDS
// ============================================================

function atualizarVariacoes() {

    const disponibilidade =
        document.getElementById(
            "variacaoDisponibilidade"
        );


    const chuva =
        document.getElementById(
            "variacaoChuva"
        );


    const consumo =
        document.getElementById(
            "variacaoConsumo"
        );


    disponibilidade.textContent =
        dados.disponibilidade < 100
            ? "↓ " +
              (100 - dados.disponibilidade) +
              "%"
            : "Estável";


    chuva.textContent =
        dados.chuva < 100
            ? "↓ " +
              (100 - dados.chuva) +
              "%"
            : "↑ acima da referência";


    consumo.textContent =
        dados.consumo > 100
            ? "↑ " +
              (dados.consumo - 100) +
              "%"
            : "Dentro do padrão";

}


// ============================================================
// ATUALIZAÇÃO DOS DADOS
// ============================================================

function atualizarDados(mostrarMensagem = false) {

    /*
        IMPORTANTE:

        Os números desta versão são simulados.

        Esta função representa a entrada de novos dados
        que futuramente poderiam vir de sensores,
        estações ou APIs.
    */


    // --------------------------------------------------------
    // PEQUENAS VARIAÇÕES
    // --------------------------------------------------------

    dados.disponibilidade =
        limitar(
            dados.disponibilidade +
            numeroAleatorio(-2, 1),
            50,
            100
        );


    dados.chuva =
        limitar(
            dados.chuva +
            numeroAleatorio(-4, 4),
            0,
            150
        );


    dados.consumo =
        limitar(
            dados.consumo +
            numeroAleatorio(-3, 6),
            80,
            160
        );


    dados.nivel =
        limitar(
            dados.nivel +
            numeroAleatorio(-5, 3),
            100,
            500
        );


    dados.vazao =
        Math.max(
            5,
            dados.vazao +
            (Math.random() * 3 - 1.5)
        );


    // --------------------------------------------------------
    // ADICIONA AO HISTÓRICO
    // --------------------------------------------------------

    historicoConsumo.push(
        dados.consumo
    );


    if (historicoConsumo.length > 12) {

        historicoConsumo.shift();

    }


    // --------------------------------------------------------
    // ATUALIZA INTERFACE
    // --------------------------------------------------------

    atualizarInterface();

    atualizarHora();

    atualizarGrafico();


    // --------------------------------------------------------
    // REGISTRA EVENTO
    // --------------------------------------------------------

    const resultado =
        calcularRisco();


    registrarEvento(resultado);


    // --------------------------------------------------------
    // FEEDBACK
    // --------------------------------------------------------

    if (mostrarMensagem) {

        const botao =
            document.querySelector(".atualizar");


        const textoOriginal =
            botao.textContent;


        botao.textContent =
            "✓ Atualizado";


        setTimeout(
            function () {

                botao.textContent =
                    textoOriginal;

            },
            1000
        );

    }

}


// ============================================================
// HORA
// ============================================================

function atualizarHora() {

    const agora =
        new Date();


    const horas =
        String(
            agora.getHours()
        ).padStart(2, "0");


    const minutos =
        String(
            agora.getMinutes()
        ).padStart(2, "0");


    const segundos =
        String(
            agora.getSeconds()
        ).padStart(2, "0");


    const hora =
        horas +
        ":" +
        minutos +
        ":" +
        segundos;


    const elemento =
        document.getElementById("hora");


    const elementoTempo =
        document.getElementById("horaTempo");


    if (elemento) {

        elemento.textContent =
            hora;

    }


    if (elementoTempo) {

        elementoTempo.textContent =
            hora;

    }

}


// ============================================================
// NÚMERO ALEATÓRIO
// ============================================================

function numeroAleatorio(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


// ============================================================
// LIMITADOR
// ============================================================

function limitar(
    valor,
    minimo,
    maximo
) {

    return Math.max(
        minimo,
        Math.min(
            valor,
            maximo
        )
    );

}


// ============================================================
// GRÁFICO
// ============================================================

let grafico = null;


function criarGrafico() {

    const canvas =
        document.getElementById(
            "grafico"
        );


    if (!canvas) {

        return;

    }


    const contexto =
        canvas.getContext("2d");


    grafico =
        new Chart(
            contexto,
            {

                type: "line",

                data: {

                    labels: [
                        "D1",
                        "D2",
                        "D3",
                        "D4",
                        "D5",
                        "D6",
                        "D7",
                        "Atual"
                    ],

                    datasets: [

                        {

                            label:
                                "Consumo relativo (%)",

                            data:
                                historicoConsumo,

                            borderWidth:
                                3,

                            tension:
                                0.3,

                            fill:
                                false,

                            pointRadius:
                                4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                false,

                            suggestedMin:
                                80,

                            suggestedMax:
                                150

                        }

                    }

                }

            }
        );

}


// ============================================================
// ATUALIZAR GRÁFICO
// ============================================================

function atualizarGrafico() {

    if (!grafico) {

        return;

    }


    grafico.data.labels =
        historicoConsumo.map(
            function (_, indice) {

                return "D" +
                    (indice + 1);

            }
        );


    grafico.data.datasets[0].data =
        historicoConsumo;


    grafico.update();

}


// ============================================================
// ALERTAS
// ============================================================

function atualizarAlerta(resultado) {

    const alerta =
        document.getElementById(
            "alertaPrincipal"
        );


    const titulo =
        document.getElementById(
            "tituloAlerta"
        );


    const descricao =
        document.getElementById(
            "descricaoAlerta"
        );


    const tendencia =
        document.getElementById(
            "tendenciaAlerta"
        );


    const recomendacao =
        document.getElementById(
            "recomendacao"
        );


    if (
        resultado.nivel === "CRÍTICO" ||
        resultado.nivel === "ALTO"
    ) {

        alerta.classList.remove(
            "normal"
        );


        titulo.textContent =
            "Alterações relevantes detectadas";


        descricao.textContent =
            "Os indicadores analisados apresentam alterações que elevaram o nível de atenção do sistema.";


        tendencia.textContent =
            "Tendência: atenção elevada.";


        recomendacao.textContent =
            "Acompanhar os indicadores com maior frequência e investigar as alterações identificadas, sem assumir previamente uma causa.";

    }

    else {

        alerta.classList.add(
            "normal"
        );


        titulo.textContent =
            "Monitoramento preventivo ativo";


        descricao.textContent =
            "O sistema continua acompanhando os indicadores em busca de alterações relevantes.";


        tendencia.textContent =
            "Tendência: monitoramento contínuo.";


        recomendacao.textContent =
            "Manter o acompanhamento dos dados e observar mudanças no padrão de consumo e disponibilidade.";

    }

}


// ============================================================
// REGISTRAR EVENTO
// ============================================================

function registrarEvento(resultado) {

    const agora =
        new Date();


    const horario =
        String(
            agora.getHours()
        ).padStart(2, "0")
        +
        ":" +
        String(
            agora.getMinutes()
        ).padStart(2, "0");


    let evento;


    if (
        resultado.nivel === "CRÍTICO"
    ) {

        evento = {

            icone: "🔴",

            titulo:
                "Risco crítico identificado",

            horario:
                horario,

            descricao:
                "Nova análise elevou o nível de risco."

        };

    }

    else if (
        resultado.nivel === "ALTO"
    ) {

        evento = {

            icone: "🟠",

            titulo:
                "Risco elevado identificado",

            horario:
                horario,

            descricao:
                "Alterações relevantes foram detectadas."

        };

    }

    else if (
        dados.consumo > 110
    ) {

        evento = {

            icone: "⚠️",

            titulo:
                "Anomalia de consumo",

            horario:
                horario,

            descricao:
                "Consumo acima do padrão de referência."

        };

    }

    else {

        evento = {

            icone: "🟢",

            titulo:
                "Monitoramento atualizado",

            horario:
                horario,

            descricao:
                "Nova análise concluída."

        };

    }


    historicoAlertas.unshift(
        evento
    );


    if (
        historicoAlertas.length > 6
    ) {

        historicoAlertas.pop();

    }


    mostrarHistoricoAlertas();

}


// ============================================================
// MOSTRAR HISTÓRICO
// ============================================================

function mostrarHistoricoAlertas() {

    const container =
        document.getElementById(
            "historicoAlertas"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    historicoAlertas.forEach(
        function (evento) {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "evento";


            elemento.innerHTML = `

                <div class="evento-icone">
                    ${evento.icone}
                </div>

                <div class="evento-info">

                    <b>
                        ${evento.titulo}
                    </b>

                    <small>
                        ${evento.horario}
                        •
                        ${evento.descricao}
                    </small>

                </div>

            `;


            container.appendChild(
                elemento
            );

        }
    );

}


// ============================================================
// ATUALIZAÇÃO DO RELÓGIO
// ============================================================

setInterval(
    function () {

        atualizarHora();

    },
    1000
);


// ============================================================
// SIMULAÇÃO DE ATUALIZAÇÃO AUTOMÁTICA
// ============================================================

/*
    A cada 30 segundos o protótipo simula
    a chegada de uma nova leitura.

    Isso NÃO significa que esteja conectado
    a dados reais.
*/

setInterval(
    function () {

        atualizarDados(false);

    },
    30000
);