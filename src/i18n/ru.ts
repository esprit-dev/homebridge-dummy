const ru = {

  accessory: {
    badValueType: 'у %s ожидался тип %s, но получен %s',
    missingRequired: 'у %s отсутствует обязательное поле %s',
  },

  command: {
    error: 'у %s не удалось выполнить команду',
    executed: '%s выполнил команду',
  },

  lightbulb: {
    brightness: 'яркость %s — %d %',
    stateOn: '%s включен, яркость — %d %',
  },

  limiter: {
    badPeriod: 'Временное ограничение для %s имеет недопустимый период %s. Должен быть одним из: %s',
    badUnits: 'Для %s указаны недопустимые единицы %s. Допустимые: %s',
    expired: 'Временное ограничение для %s истекло',
    limitExceedsPeriod: 'Временное ограничение для %s превышает период. Пожалуйста, уменьшите лимит или увеличьте период.',
    remainingDayPlus: 'Временное ограничение для %s: осталось более суток',
    remainingHours: 'Временное ограничение для %s: осталось %s часов',
    remainingMinutes: 'Временное ограничение для %s: осталось %s минут',
    remainingSeconds: 'Временное ограничение для %s: осталось %s секунд',
  },

  lock: {
    badDefault: 'у %s недопустимое состояние замка по умолчанию %s. Должно быть одним из: %s',
    secured: '%s заблокирован',
    unsecured: '%s разблокирован',
  },

  onOff: {
    stateOff: '%s выключен',
    stateOn: '%s включен',
  },

  position: {
    badDefault: 'у %s недопустимое положение по умолчанию %s. Должно быть одним из: %s',
    closed: '%s закрыт',
    open: '%s открыт',
  },

  schedule: {
    badType: 'у %s недопустимый тип расписания %s. Должен быть одним из: %s',
    badUnits: 'в расписании %s указаны недопустимые единицы времени %s. Допустимые: %s',
    cron: 'Запуск cron-задачи расписания для %s',
  },

  thermostat: {
    auto: '%s установлен в режим Auto',
    badDefault: 'у %s недопустимое состояние по умолчанию %s. Должно быть одним из: %s',
    cool: '%s установлен в режим Cool',
    heat: '%s установлен в режим Heat',
    off: '%s установлен в режим Off',
  },

  config: {
    description: {
      commands: 'Выполнять произвольные команды (например, curl) при изменении состояния аксессуара',
      cron: 'Посетите crontab.guru для справки',
      limiter: 'Ограничить суммарное время, когда аксессуар может быть в нештатном (не по умолчанию) состоянии, для каждого указанного периода',
      random: 'Время будет случайным, указанное значение — максимум',
      schedule: 'Устанавливать аксессуар в противоположное (не по умолчанию) значение через заданные интервалы или в указанное время',
      timerControlled: 'Вместо зеркалирования аксессуара датчик будет активирован при авто-сбросе аксессуара',
    },

    enumNames: {
      auto: 'Авто',
      carbonDioxideSensor: 'Углекислый газ',
      carbonMonoxideSensor: 'Угарный газ',
      celsius: '°C',
      closed: 'Закрыто',
      contactSensor: 'Контакт',
      cool: 'Охлаждение',
      cron: 'Cron',
      custom: 'Пользовательский',
      daily: 'Ежедневно',
      day: 'День',
      door: 'Дверь',
      fahrenheit: '°F',
      heat: 'Обогрев',
      hour: 'Час',
      hourly: 'Ежечасно',
      hours: 'Часы',
      interval: 'Интервал',
      leakSensor: 'Протечка',
      lightbulb: 'Лампочка',
      lockMechanism: 'Замок',
      minutely: 'Ежеминутно',
      month: 'Месяц',
      monthly: 'Ежемесячно',
      occupancySensor: 'Присутствие',
      off: 'Выкл.',
      on: 'Вкл.',
      open: 'Открыто',
      outlet: 'Розетка',
      milliseconds: 'Миллисекунды',
      minutes: 'Минуты',
      motionSensor: 'Движение',
      secondly: 'Ежесекундно',
      seconds: 'Секунды',
      secured: 'Заблокировано',
      smokeSensor: 'Дым',
      switch: 'Выключатель',
      thermostat: 'Термостат',
      unsecured: 'Разблокировано',
      week: 'Неделя',
      weekdays: 'Будни',
      weekends: 'Выходные',
      weekly: 'Еженедельно',
      window: 'Окно',
      windowCovering: 'Оконные шторы (жалюзи)',
      yearly: 'Ежегодно',
    },

    no: 'Нет',
    support: 'Документация и поддержка: %s',
    thankYou: 'Спасибо за установку %s',
    yes: 'Да',

    title: {
      accessory: 'Аксессуар',
      commandClose: 'Команда закрытия',
      commandOff: 'Команда выкл.',
      commandOn: 'Команда вкл.',
      commandOpen: 'Команда открытия',
      commandLock: 'Команда блокировки',
      commands: 'Команды',
      commandTemperature: 'Команда изменения температуры',
      commandUnlock: 'Команда разблокировки',
      cron: 'Cron',
      cronCustom: 'Произвольный Cron',
      defaultPosition: 'Положение по умолчанию',
      defaultState: 'Состояние по умолчанию',
      defaultTemperature: 'Температура по умолчанию',
      disableLogging: 'Отключить логирование',
      enableWebhook: 'Включить вебхук',
      groupName: 'Имя группы',
      interval: 'Интервал',
      limit: 'Лимит',
      limiter: 'Лимит времени',
      name: 'Имя',
      period: 'За период',
      preset: 'Предустановка',
      random: 'Случайность',
      resetOnRestart: 'Сброс при перезапуске',
      schedule: 'Расписание',
      sensor: 'Подключить датчик',
      timerControlled: 'Активировать датчик при авто-сбросе',
      type: 'Тип',
      units: 'Единицы',
    },
  },

  sensor: {
    badType: 'у %s недопустимый тип датчика %s. Должен быть одним из: %s',

    carbonDioxide: {
      active: '%s зафиксировал углекислый газ',
      inactive: '%s перестал фиксировать углекислый газ',
    },

    carbonMonoxide: {
      active: '%s зафиксировал угарный газ',
      inactive: '%s перестал фиксировать угарный газ',
    },

    contact: {
      active: '%s обнаружил контакт',
      inactive: '%s перестал обнаруживать контакт',
    },

    leak: {
      active: '%s обнаружил течь',
      inactive: '%s перестал обнаруживать течь',
    },

    motion: {
      active: '%s обнаружил движение',
      inactive: '%s перестал обнаруживать движение',
    },

    occupancy: {
      active: '%s обнаружил присутствие',
      inactive: '%s перестал обнаруживать присутствие',
    },

    smoke: {
      active: '%s обнаружил дым',
      inactive: '%s перестал обнаруживать дым',
    },
  },

  startup: {
    newAccessory: 'Добавление нового аксессуара:',
    removeAccessory: 'Удаление аксессуара:',
    restoringAccessory: 'Восстановление аксессуара:',
    setupComplete: '✓ Настройка завершена',
    unsupportedType: 'Тип аксессуара %s не поддерживается',
    welcome: [
      'Поставьте ★ этому плагину на GitHub, если он вам полезен! https://github.com/mpatfield/homebridge-dummy',
      'Хотите спонсировать этот плагин? https://github.com/sponsors/mpatfield',
      'Хотите видеть плагин на вашем языке? Посетите https://github.com/mpatfield/homebridge-dummy/issues/105',
    ],
  },

  webhook: {
    badPort: 'Порт для сервера вебхуков должен быть числом. Возврат к значению по умолчанию %d',
    badUnits: 'В команде вебхука %s указаны недопустимые единицы температуры %s. Допустимые: ',
    received: 'Команда вебхука получена',
    started: 'Сервер вебхуков слушает порт %s',
    stopped: 'Сервер вебхуков остановлен',
    stopping: 'Остановка сервера вебхуков…',
    validRange: 'Команда вебхука %s ожидает числовое значение между %s и %s',
    validValues: 'Допустимые значения для команды вебхука %s:',
    unregisteredCharacteristic: 'Нет аксессуаров, зарегистрированных для команды вебхука %s. Вы включили «Вебхук» для этого аксессуара?',
    unsupportedCharacteristic: 'Команда вебхука %s не поддерживается',
    unregisteredId: 'Нет аксессуара, зарегистрированного для вебхуков с id %s. Правильный id указан в JSON-конфиге.',
  },
};

export default ru;
