import type { Lang } from "../types";

export const T: Record<Lang, any> = {
  pt: {
    systemActive: "SISTEMA ATIVO", model: "MODELO IA v4.0", operator: "Operador",
    alerts: "ALERTAS ATIVOS", areas: "ÁREAS MONITORADAS", sensors: "SENSORES ONLINE",
    teams: "EQUIPES EM CAMPO", lives: "VIDAS PROTEGIDAS", damage: "PREJUÍZO EVITADO",
    actions: "AÇÕES RÁPIDAS", emitAlert: "EMITIR ALERTA", dispatch: "DESPACHAR EQUIPE",
    civil: "DEFESA CIVIL", comm: "COMUNICADO", checkSensors: "SENSORES", report: "RELATÓRIO",
    building: "Módulos em construção", inDev: "Módulo em desenvolvimento",
    subtitle: "Monitoramento preditivo em tempo real • Estado de São Paulo",
    nav: {
      dashboard: "Painel Central", map: "Mapa Inteligente", disasters: "Catástrofes Naturais",
      urban: "Monitoramento Urbano", ai: "IA Preditiva", alertSystem: "Sistema de Alertas",
      impact: "Impacto Social", data: "Integração de Dados", automation: "Automação IA",
      tech: "Tecnologias", global: "Visão Global", reports: "Relatórios"
    },
    ai: {
      title: "INTELIGÊNCIA ARTIFICIAL PREDITIVA",
      subtitle: "Previsões • Classificação de risco • Alertas automáticos preventivos",
      accuracy: "PRECISÃO DO MODELO", predictions: "PREVISÕES ATIVAS", autoAlerts: "ALERTAS AUTO", window: "JANELA PREV.",
      critical: "CRÍTICO", high: "ALTO", medium: "MÉDIO", low: "BAIXO",
      probability: "Probabilidade", confidence: "Confiança IA", factors: "Fatores contribuintes",
      recommendation: "Recomendação", window_label: "Janela", modelActive: "Modelo ativo", lastUpdate: "Última atualização",
      events: [
        { title: "Enchente Urbana", location: "Zona Sul – Jabaquara, Santo Amaro", level: "critical", probability: 87, confidence: 92, window: "Próximas 6 horas", factors: ["Precipitação 120mm prevista", "Solo saturado", "Maré alta"], recommendation: "Evacuar áreas de risco imediato" },
        { title: "Deslizamento de Terra", location: "Zona Norte – Brasilândia", level: "high", probability: 73, confidence: 85, window: "12–24 horas", factors: ["Acumulado 72h: 180mm", "Inclinação > 30°", "Histórico"], recommendation: "Monitoramento intensivo e alerta preventivo" },
        { title: "Colapso de Tráfego", location: "Marginal Pinheiros", level: "medium", probability: 65, confidence: 78, window: "Hoje 17:00–20:00", factors: ["Evento Allianz Parque", "Obras Km 8", "Chuva prevista"], recommendation: "Ativar rotas alternativas" },
        { title: "Onda de Calor", location: "Região Metropolitana", level: "medium", probability: 82, confidence: 88, window: "Próximos 3–5 dias", factors: ["Massa de ar quente", "Baixa umidade"], recommendation: "Alertar população vulnerável" },
        { title: "Tempestade Severa", location: "Zona Leste", level: "low", probability: 35, confidence: 62, window: "48–72 horas", factors: ["Sistema frontal", "Instabilidade moderada"], recommendation: "Monitoramento padrão" },
      ]
    },
    alertSystem: {
      title: "SISTEMA DE ALERTAS",
      subtitle: "Autoridades • População • Por região • Simulação preditiva",
      sent: "ENVIADOS", pending: "PENDENTES", reach: "ALCANCE", regions: "REGIÕES",
      newAlert: "NOVO ALERTA", high: "ALTA", medium: "MEDIA", low: "BAIXA",
      sent_label: "Enviado", pending_label: "Pendente", scheduled: "Agendado",
      sendNow: "ENVIAR AGORA",
      alerts: [
        { title: "Risco Iminente de Enchente", level: "high", status: "sent", message: "Defesa Civil e bombeiros devem se posicionar nas áreas de risco da Zona Sul", region: "Zona Sul - SP", reach: 45, channels: ["SMS", "App", "Rádio"], time: "Há 5 min" },
        { title: "Alerta de Tempestade Severa", level: "high", status: "sent", message: "Evite áreas alagáveis e busque abrigo. Risco de ventos fortes nas próximas horas.", region: "Grande São Paulo", reach: 2500000, channels: ["SMS", "TV", "Rádio", "App"], time: "Há 15 min" },
        { title: "Previsão: Deslizamento em 24h", level: "medium", status: "pending", message: "IA detectou 73% de probabilidade de deslizamento na região da Brasilândia", region: "Brasilândia - ZN", reach: 8, channels: ["App", "Email"], time: "Agendado 06:00" },
        { title: "Sensor: Nível Crítico Rio Tietê", level: "high", status: "sent", message: "Nível do rio ultrapassou 4.2m - acionamento automático de protocolo", region: "Marginal Tietê", reach: 120, channels: ["SMS", "App"], time: "Há 2 min" },
        { title: "Aviso de Calor Extremo", level: "low", status: "scheduled", message: "Temperaturas acima de 38°C previstas. Hidrate-se e evite exposição solar.", region: "Estado de SP", reach: 45000000, channels: ["SMS", "TV"], time: "Amanhã 08:00" },
      ]
    },
    disasters: {
      title: "MONITORAMENTO DE CATÁSTROFES NATURAIS",
      subtitle: "Enchentes • Deslizamentos • Queimadas • Secas • Tempestades • Terremotos",
      riskLevel: "Nível de Risco", alertsLabel: "Alertas", areasLabel: "Áreas", updated: "Atualizado",
      alert: "Alerta", critical: "Crítico", safe: "Seguro", monitoring: "Monitorando",
      types: [
        { name: "Enchentes", icon: "🌊", status: "alert", risk: 72, alerts: 3, areas: 12, updated: "há 2 min" },
        { name: "Deslizamentos", icon: "⛰️", status: "critical", risk: 85, alerts: 2, areas: 5, updated: "há 5 min" },
        { name: "Queimadas", icon: "🔥", status: "safe", risk: 23, alerts: 0, areas: 0, updated: "há 10 min" },
        { name: "Secas Extremas", icon: "☀️", status: "monitoring", risk: 45, alerts: 1, areas: 8, updated: "há 1h" },
        { name: "Tempestades Severas", icon: "⛈️", status: "alert", risk: 68, alerts: 2, areas: 15, updated: "há 8 min" },
        { name: "Terremotos", icon: "🌍", status: "safe", risk: 8, alerts: 0, areas: 0, updated: "há 30 min" },
      ]
    }
  },
  en: {
    systemActive: "SYSTEM ACTIVE", model: "AI MODEL v4.0", operator: "Operator",
    alerts: "ACTIVE ALERTS", areas: "MONITORED AREAS", sensors: "SENSORS ONLINE",
    teams: "TEAMS IN FIELD", lives: "LIVES PROTECTED", damage: "DAMAGE AVOIDED",
    actions: "QUICK ACTIONS", emitAlert: "EMIT ALERT", dispatch: "DISPATCH TEAM",
    civil: "CIVIL DEFENSE", comm: "BROADCAST", checkSensors: "SENSORS", report: "REPORT",
    building: "Modules under construction", inDev: "Module under development",
    subtitle: "Real-time predictive monitoring • State of São Paulo",
    nav: {
      dashboard: "Command Center", map: "Smart Map", disasters: "Natural Disasters",
      urban: "Urban Monitoring", ai: "Predictive AI", alertSystem: "Alert System",
      impact: "Social Impact", data: "Data Integration", automation: "AI Automation",
      tech: "Technologies", global: "Global Vision", reports: "Reports"
    },
    ai: {
      title: "PREDICTIVE ARTIFICIAL INTELLIGENCE",
      subtitle: "Forecasts • Risk classification • Automatic preventive alerts",
      accuracy: "MODEL ACCURACY", predictions: "ACTIVE PREDICTIONS", autoAlerts: "AUTO ALERTS", window: "PRED. WINDOW",
      critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW",
      probability: "Probability", confidence: "AI Confidence", factors: "Contributing factors",
      recommendation: "Recommendation", window_label: "Window", modelActive: "Model active", lastUpdate: "Last update",
      events: [
        { title: "Urban Flood", location: "South Zone – Jabaquara, Santo Amaro", level: "critical", probability: 87, confidence: 92, window: "Next 6 hours", factors: ["120mm precipitation", "Saturated soil", "High tide"], recommendation: "Evacuate risk areas immediately" },
        { title: "Landslide", location: "North Zone – Brasilândia", level: "high", probability: 73, confidence: 85, window: "12–24 hours", factors: ["72h: 180mm", "Slope > 30°", "History"], recommendation: "Intensive monitoring" },
        { title: "Traffic Collapse", location: "Marginal Pinheiros", level: "medium", probability: 65, confidence: 78, window: "Today 17:00–20:00", factors: ["Allianz Parque event", "Works Km 8"], recommendation: "Activate alternative routes" },
        { title: "Heat Wave", location: "Metropolitan Region", level: "medium", probability: 82, confidence: 88, window: "Next 3–5 days", factors: ["Hot air mass", "Low humidity"], recommendation: "Alert vulnerable population" },
        { title: "Severe Storm", location: "East Zone", level: "low", probability: 35, confidence: 62, window: "48–72 hours", factors: ["Frontal system", "Moderate instability"], recommendation: "Standard monitoring" },
      ]
    },
    alertSystem: {
      title: "ALERT SYSTEM",
      subtitle: "Authorities • Population • By region • Predictive simulation",
      sent: "SENT", pending: "PENDING", reach: "REACH", regions: "REGIONS",
      newAlert: "NEW ALERT", high: "HIGH", medium: "MEDIUM", low: "LOW",
      sent_label: "Sent", pending_label: "Pending", scheduled: "Scheduled",
      sendNow: "SEND NOW",
      alerts: [
        { title: "Imminent Flood Risk", level: "high", status: "sent", message: "Civil Defense and firefighters must position in South Zone risk areas", region: "South Zone - SP", reach: 45, channels: ["SMS", "App", "Radio"], time: "5 min ago" },
        { title: "Severe Storm Alert", level: "high", status: "sent", message: "Avoid flood-prone areas and seek shelter. Strong winds expected.", region: "Greater São Paulo", reach: 2500000, channels: ["SMS", "TV", "Radio", "App"], time: "15 min ago" },
        { title: "Landslide Forecast 24h", level: "medium", status: "pending", message: "AI detected 73% probability of landslide in Brasilândia area", region: "Brasilândia - NZ", reach: 8, channels: ["App", "Email"], time: "Scheduled 06:00" },
        { title: "Critical River Level Alert", level: "high", status: "sent", message: "River level exceeded 4.2m - automatic protocol triggered", region: "Marginal Tietê", reach: 120, channels: ["SMS", "App"], time: "2 min ago" },
        { title: "Extreme Heat Warning", level: "low", status: "scheduled", message: "Temperatures above 38°C forecast. Stay hydrated.", region: "State of SP", reach: 45000000, channels: ["SMS", "TV"], time: "Tomorrow 08:00" },
      ]
    },
    disasters: {
      title: "NATURAL DISASTER MONITORING",
      subtitle: "Floods • Landslides • Wildfires • Droughts • Storms • Earthquakes",
      riskLevel: "Risk Level", alertsLabel: "Alerts", areasLabel: "Areas", updated: "Updated",
      alert: "Alert", critical: "Critical", safe: "Safe", monitoring: "Monitoring",
      types: [
        { name: "Floods", icon: "🌊", status: "alert", risk: 72, alerts: 3, areas: 12, updated: "2 min ago" },
        { name: "Landslides", icon: "⛰️", status: "critical", risk: 85, alerts: 2, areas: 5, updated: "5 min ago" },
        { name: "Wildfires", icon: "🔥", status: "safe", risk: 23, alerts: 0, areas: 0, updated: "10 min ago" },
        { name: "Extreme Drought", icon: "☀️", status: "monitoring", risk: 45, alerts: 1, areas: 8, updated: "1h ago" },
        { name: "Severe Storms", icon: "⛈️", status: "alert", risk: 68, alerts: 2, areas: 15, updated: "8 min ago" },
        { name: "Earthquakes", icon: "🌍", status: "safe", risk: 8, alerts: 0, areas: 0, updated: "30 min ago" },
      ]
    }
  },
  es: {
    systemActive: "SISTEMA ACTIVO", model: "MODELO IA v4.0", operator: "Operador",
    alerts: "ALERTAS ACTIVAS", areas: "ÁREAS MONITOREADAS", sensors: "SENSORES EN LÍNEA",
    teams: "EQUIPOS EN CAMPO", lives: "VIDAS PROTEGIDAS", damage: "DAÑO EVITADO",
    actions: "ACCIONES RÁPIDAS", emitAlert: "EMITIR ALERTA", dispatch: "DESPACHAR EQUIPO",
    civil: "DEFENSA CIVIL", comm: "COMUNICADO", checkSensors: "SENSORES", report: "INFORME",
    building: "Módulos en construcción", inDev: "Módulo en desarrollo",
    subtitle: "Monitoreo predictivo en tiempo real • Estado de São Paulo",
    nav: {
      dashboard: "Panel Central", map: "Mapa Inteligente", disasters: "Catástrofes Naturales",
      urban: "Monitoreo Urbano", ai: "IA Predictiva", alertSystem: "Sistema de Alertas",
      impact: "Impacto Social", data: "Integración de Datos", automation: "Automatización IA",
      tech: "Tecnologías", global: "Visión Global", reports: "Informes"
    },
    ai: {
      title: "INTELIGENCIA ARTIFICIAL PREDICTIVA",
      subtitle: "Previsiones • Clasificación de riesgo • Alertas automáticas preventivas",
      accuracy: "PRECISIÓN DEL MODELO", predictions: "PREDICCIONES ACTIVAS", autoAlerts: "ALERTAS AUTO", window: "VENTANA PREV.",
      critical: "CRÍTICO", high: "ALTO", medium: "MEDIO", low: "BAJO",
      probability: "Probabilidad", confidence: "Confianza IA", factors: "Factores contribuyentes",
      recommendation: "Recomendación", window_label: "Ventana", modelActive: "Modelo activo", lastUpdate: "Última actualización",
      events: [
        { title: "Inundación Urbana", location: "Zona Sur – Jabaquara, Santo Amaro", level: "critical", probability: 87, confidence: 92, window: "Próximas 6 horas", factors: ["Precipitación 120mm", "Suelo saturado", "Marea alta"], recommendation: "Evacuar áreas de riesgo" },
        { title: "Deslizamiento de Tierra", location: "Zona Norte – Brasilândia", level: "high", probability: 73, confidence: 85, window: "12–24 horas", factors: ["72h: 180mm", "Inclinación > 30°"], recommendation: "Monitoreo intensivo" },
        { title: "Colapso de Tráfico", location: "Marginal Pinheiros", level: "medium", probability: 65, confidence: 78, window: "Hoy 17:00–20:00", factors: ["Evento Allianz", "Obras Km 8"], recommendation: "Activar rutas alternativas" },
        { title: "Ola de Calor", location: "Región Metropolitana", level: "medium", probability: 82, confidence: 88, window: "Próximos 3–5 días", factors: ["Masa de aire caliente"], recommendation: "Alertar población vulnerable" },
        { title: "Tormenta Severa", location: "Zona Este", level: "low", probability: 35, confidence: 62, window: "48–72 horas", factors: ["Sistema frontal"], recommendation: "Monitoreo estándar" },
      ]
    },
    alertSystem: {
      title: "SISTEMA DE ALERTAS",
      subtitle: "Autoridades • Población • Por región • Simulación predictiva",
      sent: "ENVIADOS", pending: "PENDIENTES", reach: "ALCANCE", regions: "REGIONES",
      newAlert: "NUEVA ALERTA", high: "ALTA", medium: "MEDIA", low: "BAJA",
      sent_label: "Enviado", pending_label: "Pendiente", scheduled: "Programado",
      sendNow: "ENVIAR AHORA",
      alerts: [
        { title: "Riesgo Inminente de Inundación", level: "high", status: "sent", message: "Defensa Civil y bomberos deben posicionarse en áreas de riesgo", region: "Zona Sur - SP", reach: 45, channels: ["SMS", "App", "Radio"], time: "Hace 5 min" },
        { title: "Alerta de Tormenta Severa", level: "high", status: "sent", message: "Evite áreas inundables y busque refugio. Vientos fuertes previstos.", region: "Gran São Paulo", reach: 2500000, channels: ["SMS", "TV", "Radio", "App"], time: "Hace 15 min" },
        { title: "Previsión: Deslizamiento 24h", level: "medium", status: "pending", message: "IA detectó 73% de probabilidad de deslizamiento en Brasilândia", region: "Brasilândia - ZN", reach: 8, channels: ["App", "Email"], time: "Programado 06:00" },
        { title: "Nivel Crítico Río Tietê", level: "high", status: "sent", message: "Nivel del río superó 4.2m - protocolo automático activado", region: "Marginal Tietê", reach: 120, channels: ["SMS", "App"], time: "Hace 2 min" },
        { title: "Aviso de Calor Extremo", level: "low", status: "scheduled", message: "Temperaturas sobre 38°C previstas. Manténgase hidratado.", region: "Estado de SP", reach: 45000000, channels: ["SMS", "TV"], time: "Mañana 08:00" },
      ]
    },
    disasters: {
      title: "MONITOREO DE CATÁSTROFES NATURALES",
      subtitle: "Inundaciones • Deslizamientos • Incendios • Sequías • Tormentas • Terremotos",
      riskLevel: "Nivel de Riesgo", alertsLabel: "Alertas", areasLabel: "Áreas", updated: "Actualizado",
      alert: "Alerta", critical: "Crítico", safe: "Seguro", monitoring: "Monitoreando",
      types: [
        { name: "Inundaciones", icon: "🌊", status: "alert", risk: 72, alerts: 3, areas: 12, updated: "hace 2 min" },
        { name: "Deslizamientos", icon: "⛰️", status: "critical", risk: 85, alerts: 2, areas: 5, updated: "hace 5 min" },
        { name: "Incendios", icon: "🔥", status: "safe", risk: 23, alerts: 0, areas: 0, updated: "hace 10 min" },
        { name: "Sequías Extremas", icon: "☀️", status: "monitoring", risk: 45, alerts: 1, areas: 8, updated: "hace 1h" },
        { name: "Tormentas Severas", icon: "⛈️", status: "alert", risk: 68, alerts: 2, areas: 15, updated: "hace 8 min" },
        { name: "Terremotos", icon: "🌍", status: "safe", risk: 8, alerts: 0, areas: 0, updated: "hace 30 min" },
      ]
    }
  }
};