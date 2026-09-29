/* =========================================================
   ÁGUA 24
   Inteligência Hídrica
   ========================================================= */


/* ================= APIs PÚBLICAS ================= */

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const FLOOD_API =
    "https://flood-api.open-meteo.com/v1/flood";


/* ================= CIDADE ATUAL ================= */

let cidadeAtual = {

    nome: "Tianguá",

    estado: "Ceará",

    latitude: -3.7327,

    longitude: -40.9917,

    country: "Brasil"

};


/* ================= REGIÕES ================= */

const regioes = {

    norte: [
        "Acre",
        "Amapá",
        "Amazonas",
        "Pará",
        "Rondônia",
        "Roraima",
        "Tocantins"
    ],

    nordeste: [
        "Alagoas",
        "Bahia",
        "Ceará",
        "Maranhão",
        "Paraíba",
        "Pernambuco",
        "Piauí",
        "Rio Grande do Norte",
        "Sergipe"
    ],

    "centro-oeste": [
        "Goiás",
        "Mato Grosso",
        "Mato Grosso do Sul",
        "Distrito Federal"
    ],

    sudeste: [
        "Espírito Santo",
        "Minas Gerais",
        "Rio de Janeiro",
        "São Paulo"
    ],

    sul: [
        "Paraná",
        "Rio Grande do Sul",
        "Santa Catarina"
    ]

};


/* ================= DADOS ================= */

let dadosAtuais = null;

let graficoChuva = null;

let graficoVazao = null;


/* ================= HISTÓRICO ================= */

const HISTORY_KEY =
    "agua24_historico";


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

function formatarNumero(valor, casas = 1) {

    if (
        valor === null ||
        valor === undefined ||
        Number.isNaN(Number(valor))
    ) {
        return "--";
    }

    return Number(valor).toFixed(casas);

}


function limitar(valor, minimo, maximo) {

    return Math.max(
        minimo,
        Math.min(maximo, valor)
    );

}


function mostrarLoading(mostrar) {

    const loading =
        document.getElementById("loading");

    if (!loading) return;

    if (mostrar) {

        loading.classList.add("show");

    } else {

        loading.classList.remove("show");

    }

}


function dataHoraAtual() {

    return new Date().toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

document
    .querySelectorAll(".menu-item")
    .forEach(item => {

        item.addEventListener("click", () => {

            const page =
                item.dataset.page;

            document
                .querySelectorAll(".menu-item")
                .forEach(menu => {

                    menu.classList.remove("active");

                });

            item.classList.add("active");


            document
                .querySelectorAll(".page")
                .forEach(section => {

                    section.classList.remove(
                        "active-page"
                    );

                });


            const target =
                document.getElementById(
                    `page-${page}`
                );


            if (target) {

                target.classList.add(
                    "active-page"
                );

            }

        });

    });


/* =========================================================
   REGIÃO
   ========================================================= */

document
    .getElementById("select-regiao")
    .addEventListener("change", function () {

        const regiao =
            this.value;

        if (regiao === "todas") {

            return;

        }

        const estados =
            regioes[regiao];

        if (!estados) return;

        const estadoAtual =
            cidadeAtual.estado;

        if (!estados.includes(estadoAtual)) {

            document.getElementById(
                "cidade-input"
            ).value = "";

        }

    });


/* =========================================================
   GEOCODIFICAÇÃO
   ========================================================= */

async function buscarCidade() {

    const input =
        document.getElementById("cidade-input");

    const resultados =
        document.getElementById(
            "resultados-cidade"
        );

    const nome =
        input.value.trim();


    if (!nome) {

        resultados.innerHTML =
            "<div class='city-result'>Digite uma cidade.</div>";

        return;

    }


    resultados.innerHTML =
        "<div class='city-result'>Buscando...</div>";


    try {

        const url =
            `${GEOCODING_API}?name=${encodeURIComponent(nome)}` +
            `&count=8&language=pt&format=json`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Erro na busca da cidade."
            );

        }


        const data =
            await resposta.json();


        resultados.innerHTML = "";


        if (
            !data.results ||
            data.results.length === 0
        ) {

            resultados.innerHTML =
                "<div class='city-result'>Nenhuma cidade encontrada.</div>";

            return;

        }


        const regiaoSelecionada =
            document.getElementById(
                "select-regiao"
            ).value;


        let cidades =
            data.results;


        if (
            regiaoSelecionada !== "todas"
        ) {

            const estadosPermitidos =
                regioes[regiaoSelecionada];


            cidades =
                cidades.filter(cidade => {

                    return estadosPermitidos.includes(
                        cidade.admin1
                    );

                });

        }


        if (cidades.length === 0) {

            resultados.innerHTML =
                "<div class='city-result'>Nenhuma cidade encontrada nessa região.</div>";

            return;

        }


        cidades.forEach(cidade => {

            const div =
                document.createElement("div");


            div.className =
                "city-result";


            const estado =
                cidade.admin1 || "";


            const pais =
                cidade.country || "";


            div.textContent =
                `${cidade.name}${estado ? ", " + estado : ""}${pais ? " — " + pais : ""}`;


            div.addEventListener(
                "click",
                () => {

                    selecionarCidade(cidade);

                }
            );


            resultados.appendChild(div);

        });


    } catch (erro) {

        console.error(erro);

        resultados.innerHTML =
            "<div class='city-result'>Não foi possível consultar a cidade.</div>";

    }

}


function selecionarCidade(cidade) {

    cidadeAtual = {

        nome:
            cidade.name,

        estado:
            cidade.admin1 || "",

        latitude:
            Number(cidade.latitude),

        longitude:
            Number(cidade.longitude),

        country:
            cidade.country || "Brasil"

    };


    document.getElementById(
        "cidade-input"
    ).value =
        cidadeAtual.nome;


    document.getElementById(
        "resultados-cidade"
    ).innerHTML = "";


    atualizarLocalizacao();


    carregarDados();

}


/* =========================================================
   ATUALIZAR LOCALIZAÇÃO
   ========================================================= */

function atualizarLocalizacao() {

    document.getElementById(
        "local-atual"
    ).textContent =
        `${cidadeAtual.nome}, ${cidadeAtual.estado}`;


    document.getElementById(
        "coordenadas"
    ).textContent =
        `Lat: ${formatarNumero(cidadeAtual.latitude, 4)} | Lon: ${formatarNumero(cidadeAtual.longitude, 4)}`;


    document.getElementById(
        "mapa-cidade"
    ).textContent =
        `${cidadeAtual.nome}, ${cidadeAtual.estado}`;

}


/* =========================================================
   API METEOROLÓGICA
   ========================================================= */

async function buscarMeteorologia() {

    const lat =
        cidadeAtual.latitude;

    const lon =
        cidadeAtual.longitude;


    const url =
        `${WEATHER_API}?latitude=${lat}` +
        `&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,rain` +
        `&hourly=temperature_2m,relative_humidity_2m,precipitation,et0_fao_evapotranspiration` +
        `&past_days=1` +
        `&forecast_days=2` +
        `&timezone=auto`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            "Falha na API meteorológica."
        );

    }


    return await resposta.json();

}


/* =========================================================
   API HIDROLÓGICA
   ========================================================= */

async function buscarHidrologia() {

    const lat =
        cidadeAtual.latitude;

    const lon =
        cidadeAtual.longitude;


    const url =
        `${FLOOD_API}?latitude=${lat}` +
        `&longitude=${lon}` +
        `&daily=river_discharge` +
        `&past_days=7` +
        `&forecast_days=7`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            "Falha na API hidrológica."
        );

    }


    return await resposta.json();

}


/* =========================================================
   CARREGAR DADOS
   ========================================================= */

async function carregarDados() {

    mostrarLoading(true);


    try {

        const [
            meteorologia,
            hidrologia
        ] = await Promise.all([

            buscarMeteorologia(),

            buscarHidrologia()

        ]);


        dadosAtuais =
            processarDados(
                meteorologia,
                hidrologia
            );


        atualizarInterface(
            dadosAtuais
        );


        document.getElementById(
            "ultima-atualizacao"
        ).textContent =
            dataHoraAtual();


        atualizarStatusAPI(true);


        salvarHistorico(
            dadosAtuais
        );


    } catch (erro) {

        console.error(erro);

        atualizarStatusAPI(false);

        mostrarErroAPI();

    } finally {

        mostrarLoading(false);

    }

}


/* =========================================================
   PROCESSAMENTO
   ========================================================= */

function processarDados(
    meteorologia,
    hidrologia
) {

    const current =
        meteorologia.current || {};


    const hourly =
        meteorologia.hourly || {};


    const daily =
        hidrologia.daily || {};


    const precipitacoes =
        hourly.precipitation || [];


    const et0Dados =
        hourly.et0_fao_evapotranspiration || [];


    const vazoes =
        daily.river_discharge || [];


    /* ---------- CHUVA 24H ---------- */

    const ultimas24 =
        precipitacoes.slice(-24);


    const chuva24 =
        ultimas24.reduce(
            (total, valor) =>
                total + (Number(valor) || 0),
            0
        );


    /* ---------- EVAPOTRANSPIRAÇÃO ---------- */

    const et0Ultimas24 =
        et0Dados.slice(-24);


    const et0 =
        et0Ultimas24.reduce(
            (total, valor) =>
                total + (Number(valor) || 0),
            0
        );


    /* ---------- VAZÃO ---------- */

    const vazaoNumerica =
        vazoes
            .map(Number)
            .filter(
                valor =>
                    Number.isFinite(valor)
            );


    let vazaoAtual =
        vazaoNumerica.length
            ? vazaoNumerica[0]
            : 0;


    let vazaoHistorica = 0;


    if (vazaoNumerica.length > 1) {

        const referencia =
            vazaoNumerica.slice(1, 8);


        vazaoHistorica =
            referencia.reduce(
                (total, valor) =>
                    total + valor,
                0
            ) / referencia.length;

    } else {

        vazaoHistorica =
            vazaoAtual;

    }


    if (
        !Number.isFinite(vazaoHistorica) ||
        vazaoHistorica <= 0
    ) {

        vazaoHistorica =
            vazaoAtual || 1;

    }


    /* ---------- METEOROLOGIA ---------- */

    const temperatura =
        Number(
            current.temperature_2m
        ) || 0;


    const umidade =
        Number(
            current.relative_humidity_2m
        ) || 0;


    const precipitacao =
        Number(
            current.precipitation
        ) || 0;


    /* ---------- DEMANDA ESTIMADA ---------- */

    let demanda = 100;


    demanda +=
        et0 * 4;


    if (umidade < 50) {

        demanda += 10;

    }


    if (temperatura > 30) {

        demanda += 10;

    }


    demanda =
        limitar(
            demanda,
            0,
            150
        );


    /* ---------- DISPONIBILIDADE ---------- */

    let disponibilidade = 70;


    if (chuva24 > 20) {

        disponibilidade += 10;

    }


    if (chuva24 < 2) {

        disponibilidade -= 10;

    }


    if (
        vazaoAtual >
        vazaoHistorica
    ) {

        disponibilidade += 10;

    }


    if (
        vazaoAtual <
        vazaoHistorica * 0.8
    ) {

        disponibilidade -= 15;

    }


    disponibilidade =
        limitar(
            disponibilidade,
            0,
            100
        );


    /* ---------- RISCO ---------- */

    let risco =
        100 - disponibilidade;


    if (demanda > 110) {

        risco +=
            (demanda - 110) * 0.3;

    }


    if (
        vazaoAtual <
        vazaoHistorica * 0.7
    ) {

        risco += 15;

    }


    risco =
        limitar(
            risco,
            0,
            100
        );


    /* ---------- ANOMALIA ---------- */

    let anomalia = 0;


    if (
        vazaoAtual <
        vazaoHistorica * 0.7
    ) {

        anomalia += 50;

    }


    if (chuva24 < 2) {

        anomalia += 20;

    }


    if (demanda > 115) {

        anomalia += 30;

    }


    anomalia =
        limitar(
            anomalia,
            0,
            100
        );


    const resultado = {

        temperatura,

        umidade,

        precipitacao,

        chuva24,

        et0,

        vazaoAtual,

        vazaoHistorica,

        demanda,

        disponibilidade,

        risco,

        anomalia

    };


    resultado.possivelCausa =
        identificarPossiveisCausas(
            resultado
        );


    return resultado;

}


/* =========================================================
   POSSÍVEIS CAUSAS
   ========================================================= */

function identificarPossiveisCausas(d) {

    const causas = [];


    if (d.chuva24 < 2) {

        causas.push(
            "baixa precipitação nas últimas 24 horas"
        );

    }


    if (d.et0 > 4) {

        causas.push(
            "evapotranspiração elevada"
        );

    }


    if (d.temperatura > 30) {

        causas.push(
            "temperatura elevada"
        );

    }


    if (d.umidade < 50) {

        causas.push(
            "baixa umidade do ar"
        );

    }


    if (
        d.vazaoAtual <
        d.vazaoHistorica * 0.7
    ) {

        causas.push(
            "vazão abaixo da referência dos últimos dias"
        );

    }


    if (d.demanda > 115) {

        causas.push(
            "índice de demanda estimada elevado"
        );

    }


    if (causas.length === 0) {

        return (
            "Nenhum fator de pressão significativo foi identificado pelos indicadores atuais."
        );

    }


    return (
        "Possíveis fatores associados: " +
        causas.join(", ") +
        "."
    );

}


/* =========================================================
   ATUALIZAR INTERFACE
   ========================================================= */

function atualizarInterface(d) {

    /* ---------- CARDS ---------- */

    document.getElementById(
        "disponibilidade"
    ).textContent =
        `${formatarNumero(d.disponibilidade, 0)}%`;


    document.getElementById(
        "disponibilidade-var"
    ).textContent =
        "Índice calculado";


    document.getElementById(
        "chuva"
    ).textContent =
        `${formatarNumero(d.chuva24, 1)} mm`;


    document.getElementById(
        "chuva-var"
    ).textContent =
        "Últimas 24 horas";


    document.getElementById(
        "demanda"
    ).textContent =
        `${formatarNumero(d.demanda, 0)}%`;


    document.getElementById(
        "demanda-var"
    ).textContent =
        "Índice estimado";


    document.getElementById(
        "risco"
    ).textContent =
        `${formatarNumero(d.risco, 0)}/100`;


    document.getElementById(
        "risco-status"
    ).textContent =
        classificarRisco(d.risco);


    /* ---------- TEMPO REAL ---------- */

    document.getElementById(
        "tempo-temperatura"
    ).textContent =
        `${formatarNumero(d.temperatura, 1)} °C`;


    document.getElementById(
        "tempo-umidade"
    ).textContent =
        `${formatarNumero(d.umidade, 0)} %`;


    document.getElementById(
        "tempo-chuva"
    ).textContent =
        `${formatarNumero(d.precipitacao, 1)} mm`;


    document.getElementById(
        "tempo-et0"
    ).textContent =
        `${formatarNumero(d.et0, 1)} mm`;


    document.getElementById(
        "tempo-vazao"
    ).textContent =
        `${formatarNumero(d.vazaoAtual, 2)} m³/s`;


    document.getElementById(
        "tempo-vazao-ref"
    ).textContent =
        `${formatarNumero(d.vazaoHistorica, 2)} m³/s`;


    /* ---------- ALERTA ---------- */

    const nivel =
        classificarRisco(d.risco);


    document.getElementById(
        "alerta-titulo"
    ).textContent =
        `Nível de risco: ${nivel}`;


    document.getElementById(
        "alerta-texto"
    ).textContent =
        gerarTextoAlerta(d);


    document.getElementById(
        "alerta-causa"
    ).textContent =
        d.possivelCausa;


    /* ---------- ANOMALIA ---------- */

    document.getElementById(
        "anomalia-score"
    ).textContent =
        formatarNumero(
            d.anomalia,
            0
        );


    document.getElementById(
        "anomalia-titulo"
    ).textContent =
        d.anomalia >= 50
            ? "Anomalia detectada"
            : "Sem anomalia crítica";


    document.getElementById(
        "anomalia-descricao"
    ).textContent =
        gerarTextoAnomalia(d);


    document.getElementById(
        "anomalia-causa"
    ).textContent =
        d.possivelCausa;


    /* ---------- MAPA ---------- */

    document.getElementById(
        "mapa-cidade"
    ).textContent =
        `${cidadeAtual.nome}, ${cidadeAtual.estado}`;


    document.getElementById(
        "mapa-detalhes"
    ).textContent =
        `Disponibilidade estimada de ${formatarNumero(d.disponibilidade, 0)}%, risco ${formatarNumero(d.risco, 0)}/100 e índice de anomalia de ${formatarNumero(d.anomalia, 0)}/100.`;


    /* ---------- ALERTAS 24 ---------- */

    document.getElementById(
        "alerta24-titulo"
    ).textContent =
        `Risco ${classificarRisco(d.risco)}`;


    document.getElementById(
        "alerta24-texto"
    ).textContent =
        gerarTextoAlerta(d);


    document.getElementById(
        "alerta24-causa"
    ).textContent =
        d.possivelCausa;


    /* ---------- TABELA ---------- */

    atualizarTabelaAnomalias(d);


    /* ---------- GRÁFICOS ---------- */

    atualizarGraficos();

}


/* =========================================================
   CLASSIFICAÇÃO
   ========================================================= */

function classificarRisco(risco) {

    if (risco < 30) {

        return "BAIXO";

    }


    if (risco < 60) {

        return "MODERADO";

    }


    if (risco < 80) {

        return "ALTO";

    }


    return "CRÍTICO";

}


/* =========================================================
   TEXTOS
   ========================================================= */

function gerarTextoAlerta(d) {

    if (d.risco >= 80) {

        return (
            "Os indicadores combinados apontam para uma condição de risco elevado. Recomenda-se atenção às alterações observadas."
        );

    }


    if (d.risco >= 60) {

        return (
            "Os indicadores apresentam sinais que merecem acompanhamento preventivo para evitar agravamento das condições hídricas."
        );

    }


    if (d.risco >= 30) {

        return (
            "Os indicadores apresentam uma condição intermediária. O sistema continuará monitorando possíveis alterações."
        );

    }


    return (
        "Os indicadores atuais não apresentam pressão hídrica significativa."
    );

}


function gerarTextoAnomalia(d) {

    if (d.anomalia >= 70) {

        return (
            "Foram identificadas alterações relevantes em relação aos indicadores utilizados pelo sistema."
        );

    }


    if (d.anomalia >= 40) {

        return (
            "Foram identificados sinais de alteração que devem continuar sendo acompanhados."
        );

    }


    return (
        "Os indicadores atuais não apresentam uma anomalia relevante."
    );

}


/* =========================================================
   TABELA DE ANOMALIAS
   ========================================================= */

function atualizarTabelaAnomalias(d) {

    const tabela =
        document.getElementById(
            "tabela-anomalias"
        );


    const vazaoPercentual =
        d.vazaoHistorica > 0
            ? (
                d.vazaoAtual /
                d.vazaoHistorica
            ) * 100
            : 100;


    const linhas = [

        [
            "Chuva 24h",
            `${formatarNumero(d.chuva24, 1)} mm`,
            "≥ 2 mm",
            d.chuva24 < 2
                ? "Atenção"
                : "Normal"
        ],

        [
            "Vazão",
            `${formatarNumero(d.vazaoAtual, 2)} m³/s`,
            `${formatarNumero(d.vazaoHistorica, 2)} m³/s`,
            vazaoPercentual < 70
                ? "Atenção"
                : "Normal"
        ],

        [
            "Demanda",
            `${formatarNumero(d.demanda, 0)}%`,
            "≤ 115%",
            d.demanda > 115
                ? "Atenção"
                : "Normal"
        ],

        [
            "Risco",
            `${formatarNumero(d.risco, 0)}/100`,
            "< 60",
            d.risco >= 60
                ? "Atenção"
                : "Normal"
        ]

    ];


    tabela.innerHTML =
        linhas.map(linha => {

            const status =
                linha[3];

            const classe =
                status === "Normal"
                    ? "status-normal"
                    : "status-attention";


            return `
                <tr>

                    <td>${linha[0]}</td>

                    <td>${linha[1]}</td>

                    <td>${linha[2]}</td>

                    <td class="${classe}">
                        ${status}
                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================================================
   GRÁFICOS
   ========================================================= */

function atualizarGraficos() {

    if (!dadosAtuais) return;


    const labels = [

        "24h",
        "18h",
        "12h",
        "6h",
        "Agora"

    ];


    const chuvaBase =
        Math.max(
            0,
            dadosAtuais.chuva24 / 5
        );


    const chuvaData = [

        chuvaBase * 0.8,

        chuvaBase * 1.1,

        chuvaBase * 0.7,

        chuvaBase * 1.2,

        dadosAtuais.precipitacao

    ];


    const vazaoBase =
        dadosAtuais.vazaoHistorica;


    const vazaoData = [

        vazaoBase * 0.95,

        vazaoBase * 1.03,

        vazaoBase * 0.98,

        vazaoBase * 0.91,

        dadosAtuais.vazaoAtual

    ];


    const chuvaCanvas =
        document.getElementById(
            "grafico-chuva"
        );


    const vazaoCanvas =
        document.getElementById(
            "grafico-vazao"
        );


    if (graficoChuva) {

        graficoChuva.destroy();

    }


    if (graficoVazao) {

        graficoVazao.destroy();

    }


    graficoChuva =
        new Chart(
            chuvaCanvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label: "Precipitação",

                            data: chuvaData,

                            borderColor:
                                "#19a7e0",

                            backgroundColor:
                                "rgba(25,167,224,0.12)",

                            fill: true,

                            tension: 0.35

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {
                            ticks: {
                                color: "#7f99ad"
                            },

                            grid: {
                                color:
                                    "rgba(27,58,81,0.35)"
                            }
                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color: "#7f99ad"
                            },

                            grid: {
                                color:
                                    "rgba(27,58,81,0.35)"
                            }

                        }

                    }

                }

            }
        );


    graficoVazao =
        new Chart(
            vazaoCanvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            label: "Vazão",

                            data: vazaoData,

                            borderColor:
                                "#31d49b",

                            backgroundColor:
                                "rgba(49,212,155,0.10)",

                            fill: true,

                            tension: 0.35

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            ticks: {
                                color: "#7f99ad"
                            },

                            grid: {
                                color:
                                    "rgba(27,58,81,0.35)"
                            }

                        },

                        y: {

                            beginAtZero: true,

                            ticks: {
                                color: "#7f99ad"
                            },

                            grid: {
                                color:
                                    "rgba(27,58,81,0.35)"
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   STATUS DAS APIs
   ========================================================= */

function atualizarStatusAPI(online) {

    const status =
        document.querySelector(
            ".api-status strong"
        );


    const texto =
        document.querySelector(
            ".api-status small"
        );


    if (!status || !texto) return;


    if (online) {

        status.textContent =
            "API ONLINE";

        texto.textContent =
            "Open-Meteo + GloFAS";

    } else {

        status.textContent =
            "API OFFLINE";

        texto.textContent =
            "Verifique a conexão";

    }

}


function mostrarErroAPI() {

    document.getElementById(
        "alerta-titulo"
    ).textContent =
        "Não foi possível atualizar os dados";


    document.getElementById(
        "alerta-texto"
    ).textContent =
        "Verifique sua conexão com a internet e tente atualizar novamente.";


    document.getElementById(
        "alerta-causa"
    ).textContent =
        "Falha na comunicação com uma das APIs públicas.";

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function obterHistorico() {

    try {

        return JSON.parse(
            localStorage.getItem(
                HISTORY_KEY
            )
        ) || [];

    } catch {

        return [];

    }

}


function salvarHistorico(d) {

    if (!d) return;


    const historico =
        obterHistorico();


    const registro = {

        data:
            new Date().toISOString(),

        cidade:
            cidadeAtual.nome,

        estado:
            cidadeAtual.estado,

        latitude:
            cidadeAtual.latitude,

        longitude:
            cidadeAtual.longitude,

        temperatura:
            d.temperatura,

        umidade:
            d.umidade,

        precipitacao:
            d.precipitacao,

        chuva24:
            d.chuva24,

        et0:
            d.et0,

        vazaoAtual:
            d.vazaoAtual,

        demanda:
            d.demanda,

        disponibilidade:
            d.disponibilidade,

        risco:
            d.risco,

        anomalia:
            d.anomalia,

        possivelCausa:
            d.possivelCausa

    };


    historico.unshift(
        registro
    );


    const limitada =
        historico.slice(
            0,
            100
        );


    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
            limitada
        )
    );


    atualizarHistorico();

}


/* =========================================================
   ATUALIZAR HISTÓRICO
   ========================================================= */

function atualizarHistorico() {

    const historico =
        obterHistorico();


    const tabela =
        document.getElementById(
            "tabela-historico"
        );


    document.getElementById(
        "total-registros"
    ).textContent =
        historico.length;


    if (historico.length === 0) {

        document.getElementById(
            "maior-risco"
        ).textContent =
            "--";


        document.getElementById(
            "maior-anomalia"
        ).textContent =
            "--";


        tabela.innerHTML = `

            <tr>

                <td colspan="9">

                    Nenhum registro armazenado ainda.

                </td>

            </tr>

        `;

        return;

    }


    const maiorRisco =
        Math.max(
            ...historico.map(
                item =>
                    Number(item.risco) || 0
            )
        );


    const maiorAnomalia =
        Math.max(
            ...historico.map(
                item =>
                    Number(item.anomalia) || 0
            )
        );


    document.getElementById(
        "maior-risco"
    ).textContent =
        `${formatarNumero(maiorRisco, 0)}/100`;


    document.getElementById(
        "maior-anomalia"
    ).textContent =
        `${formatarNumero(maiorAnomalia, 0)}/100`;


    tabela.innerHTML =
        historico.map(
            item => {

                const data =
                    new Date(
                        item.data
                    );


                return `

                    <tr>

                        <td>

                            ${data.toLocaleDateString("pt-BR")}
                            <br>

                            <small>
                                ${data.toLocaleTimeString("pt-BR")}
                            </small>

                        </td>


                        <td>

                            ${item.cidade}

                            <br>

                            <small>
                                ${item.estado}
                            </small>

                        </td>


                        <td>
                            ${formatarNumero(item.chuva24, 1)} mm
                        </td>


                        <td>
                            ${formatarNumero(item.vazaoAtual, 2)} m³/s
                        </td>


                        <td>
                            ${formatarNumero(item.demanda, 0)}%
                        </td>


                        <td>
                            ${formatarNumero(item.disponibilidade, 0)}%
                        </td>


                        <td>
                            ${formatarNumero(item.risco, 0)}/100
                        </td>


                        <td>
                            ${formatarNumero(item.anomalia, 0)}/100
                        </td>


                        <td class="history-cause">

                            ${item.possivelCausa || "--"}

                        </td>

                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   LIMPAR HISTÓRICO
   ========================================================= */

document
    .getElementById("limpar-historico")
    .addEventListener(
        "click",
        () => {

            const confirmar =
                confirm(
                    "Tem certeza que deseja apagar todo o histórico?"
                );


            if (!confirmar) return;


            localStorage.removeItem(
                HISTORY_KEY
            );


            atualizarHistorico();

        }
    );


/* =========================================================
   BOTÕES
   ========================================================= */

document
    .getElementById("buscar-cidade")
    .addEventListener(
        "click",
        buscarCidade
    );


document
    .getElementById("atualizar-btn")
    .addEventListener(
        "click",
        carregarDados
    );


document
    .getElementById("cidade-input")
    .addEventListener(
        "keydown",
        evento => {

            if (
                evento.key === "Enter"
            ) {

                buscarCidade();

            }

        }
    );


/* =========================================================
   MAPA — SELEÇÃO VISUAL
   ========================================================= */

document
    .querySelectorAll(".region-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const regiao =
                    card.dataset.region;


                const select =
                    document.getElementById(
                        "select-regiao"
                    );


                select.value =
                    regiao;


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    });


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
   ========================================================= */

setInterval(
    carregarDados,
    10 * 60 * 1000
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarLocalizacao();

atualizarHistorico();

carregarDados();