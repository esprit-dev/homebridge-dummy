const es = {

  accessory: {
    badValueType: '%s debía ser de tipo %s pero era %s',
    missingRequired: '%s le falta el campo obligatorio %s',
  },

  command: {
    error: '%s falló al ejecutar el comando',
    executed: '%s ejecutó el comando',
  },

  lightbulb: {
    brightness: 'El brillo de %s es %d%',
    stateOn: '%s está encendido, el brillo es %d%',
  },

  limiter: {
    badPeriod: 'El límite de tiempo para %s tiene un período inválido: %s. Debe ser uno de: %s',
    badUnits: 'El límite de tiempo para %s tiene unidades inválidas %s. Debe ser uno de: %s',
    expired: 'El límite de tiempo para %s ha expirado',
    limitExceedsPeriod: 'El límite de tiempo para %s excede el período. Por favor reduzca el límite o aumente el período.',
    remainingDayPlus: 'El límite de tiempo para %s tiene más de un día restante',
    remainingHours: 'El límite de tiempo para %s tiene %s horas restantes',
    remainingMinutes: 'El límite de tiempo para %s tiene %s minutos restantes',
    remainingSeconds: 'El límite de tiempo para %s tiene %s segundos restantes',
  },

  lock: {
    badDefault: '%s tiene un estado de bloqueo predeterminado inválido %s. Debe ser uno de: %s',
    secured: '%s está bloqueado',
    unsecured: '%s está desbloqueado',
  },

  onOff: {
    stateOff: '%s está apagado',
    stateOn: '%s está encendido',
  },

  position: {
    badDefault: '%s tiene una posición predeterminada inválida %s. Debe ser uno de: %s',
    closed: '%s está cerrado',
    open: '%s está abierto',
  },

  schedule: {
    badType: '%s tiene un tipo de programación inválido %s. Debe ser uno de: %s',
    badUnits: '%s la programación tiene unidades de tiempo inválidas %s. Debe ser uno de: %s',
    cron: '%s iniciando tarea programada cron',
  },

  thermostat: {
    auto: '%s configurado en Automático',
    badDefault: '%s tiene un estado predeterminado inválido %s. Debe ser uno de: %s',
    cool: '%s configurado en Frío',
    heat: '%s configurado en Calor',
    off: '%s configurado en Apagado',
  },

  config: {

    description: {
      commands: 'Ejecutar comandos arbitrarios (por ejemplo, curl) cuando el accesorio cambia de estado',
      cron: 'Visite crontab.guru para obtener ayuda (https://crontab.guru/)',
      limiter: 'Restringir el tiempo total que este accesorio puede estar en su valor no predeterminado, para cada período especificado',
      random: 'El tiempo se aleatorizará con el valor indicado como máximo',
      schedule: 'Establecer el accesorio en su valor opuesto (no predeterminado) en intervalos o momentos especificados',
      timerControlled: 'En lugar de reflejar el accesorio, el sensor se activará cuando el accesorio se reinicie automáticamente',
    },

    enumNames: {
      auto: 'Automático',
      carbonDioxideSensor: 'Dióxido de carbono',
      carbonMonoxideSensor: 'Monóxido de carbono',
      celsius: '°C',
      closed: 'Cerrado',
      contactSensor: 'Contacto',
      cool: 'Frío',
      cron: 'Cron',
      custom: 'Personalizado',
      daily: 'Diario',
      day: 'Día',
      door: 'Puerta',
      fahrenheit: '°F',
      heat: 'Calor',
      hour: 'Hora',
      hourly: 'Cada hora',
      hours: 'Horas',
      interval: 'Intervalo',
      leakSensor: 'Fuga',
      lightbulb: 'Bombilla',
      lockMechanism: 'Cerradura',
      minutely: 'Cada minuto',
      month: 'Mes',
      monthly: 'Mensual',
      occupancySensor: 'Ocupación',
      off: 'Apagado',
      on: 'Encendido',
      open: 'Abierto',
      outlet: 'Enchufe',
      milliseconds: 'Milisegundos',
      minutes: 'Minutos',
      motionSensor: 'Movimiento',
      secondly: 'Cada segundo',
      seconds: 'Segundos',
      secured: 'Bloqueado',
      smokeSensor: 'Humo',
      switch: 'Interruptor',
      thermostat: 'Termostato',
      unsecured: 'Desbloqueado',
      week: 'Semana',
      weekdays: 'Días laborables',
      weekends: 'Fines de semana',
      weekly: 'Semanal',
      window: 'Ventana',
      windowCovering: 'Cubrimiento de ventana (Persianas)',
      yearly: 'Anual',
    },

    no: 'No',
    support: 'Para documentación y soporte, por favor visite %s',
    thankYou: 'Gracias por instalar %s',
    yes: 'Sí',

    title: {
      accessory: 'Accesorio',
      commandClose: 'Comando de cierre',
      commandOff: 'Comando de apagado',
      commandOn: 'Comando de encendido',
      commandOpen: 'Comando de apertura',
      commandLock: 'Comando de bloqueo',
      commands: 'Comandos',
      commandTemperature: 'Comando cuando cambia la temperatura',
      commandUnlock: 'Comando de desbloqueo',
      cron: 'Cron',
      cronCustom: 'Cron personalizado',
      defaultPosition: 'Posición predeterminada',
      defaultState: 'Estado predeterminado',
      defaultTemperature: 'Temperatura predeterminada',
      disableLogging: 'Desactivar registro',
      enableWebhook: 'Activar webhook',
      groupName: 'Nombre del grupo',
      interval: 'Intervalo',
      limit: 'Límite',
      limiter: 'Límite de tiempo',
      name: 'Nombre',
      period: 'Per',
      preset: 'Preajuste',
      random: 'Aleatorizar',
      resetOnRestart: 'Restablecer al reiniciar',
      schedule: 'Programación',
      sensor: 'Adjuntar sensor',
      timerControlled: 'Activar sensor en reinicio automático',
      type: 'Tipo',
      units: 'Unidades',
    },
  },

  sensor: {

    badType: '%s tiene un tipo de sensor inválido %s. Debe ser uno de: %s',

    carbonDioxide: {
      active: '%s detectó dióxido de carbono',
      inactive: '%s dejó de detectar dióxido de carbono',
    },

    carbonMonoxide: {
      active: '%s detectó monóxido de carbono',
      inactive: '%s dejó de detectar monóxido de carbono',
    },

    contact: {
      active: '%s detectó contacto',
      inactive: '%s dejó de detectar contacto',
    },

    leak: {
      active: '%s detectó una fuga',
      inactive: '%s dejó de detectar la fuga',
    },

    motion: {
      active: '%s detectó movimiento',
      inactive: '%s dejó de detectar movimiento',
    },

    occupancy: {
      active: '%s detectó ocupación',
      inactive: '%s dejó de detectar ocupación',
    },

    smoke: {
      active: '%s detectó humo',
      inactive: '%s dejó de detectar humo',
    },
  },

  startup: {
    newAccessory: 'Agregando nuevo accesorio:',
    removeAccessory: 'Eliminando accesorio:',
    restoringAccessory: 'Restaurando accesorio:',
    setupComplete: '✓ Configuración completa',
    unsupportedType: 'Tipo de accesorio no compatible %s',
    welcome: [
      'Por favor ★ (ponga una estrella) en este plugin en GitHub si lo encuentra útil! https://github.com/mpatfield/homebridge-dummy',
      '¿Le gustaría patrocinar este plugin? https://github.com/sponsors/mpatfield',
      '¿Quiere ver este plugin en otro idioma? Por favor visite https://github.com/mpatfield/homebridge-dummy/issues/105',
    ],
  },

  webhook: {
    badUnits: 'El comando del webhook de %s tiene unidades de temperatura inválidas %s. Debe ser uno de:',
    received: 'Comando webhook recibido',
    started: 'Servidor webhook en ejecución y escuchando en el puerto %s',
    stopped: 'Servidor webhook se ha detenido',
    stopping: 'Deteniendo el servidor webhook…',
    validRange: 'El comando webhook %s espera un valor numérico entre %s y %s',
    validValues: 'Los valores válidos para el comando webhook %s son:',
    unregisteredCharacteristic: 'No hay accesorios registrados para el comando del webhook %s. Hizo click en \'Activar Webhook\' para este accesorio?',
    unsupportedCharacteristic: 'El comando webhook %s no está permitido',
    unregisteredId: 'No hay ningún accesorio registrado para webhooks con el id %s. Puede encontrar el id correcto en la configuración JSON.',
  },
};

export default es;