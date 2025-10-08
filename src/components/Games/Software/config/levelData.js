export const LEVELS = [
  {
    id: 0,
    title: "Fundamentos: Color y tamaño",
    description: "Aprende a cambiar el color y tamaño de un elemento",
    html: `
      <div class="target-element">
        ¡Hola CSS!
      </div>
    `,
    baseCSS: `
      .target-element {
        padding: 20px;
        margin: 20px;
        border: 1px solid #ccc;
      }
    `,
    availableProperties: [
      'color',
      'background-color',
      'font-size',
      'font-weight'
    ],
    expectedResult: {
      css: `
        .target-element {
          padding: 20px;
          margin: 20px;
          border: 1px solid #ccc;
          color: #0000ff;
          background-color: #e3f2fd;
          font-size: 20px;
          font-weight: 700;
        }
      `,
      description: "Cambia el texto a azul, fondo azul claro, tamaño grande y negrita"
    },
    validation: {
      requiredProperties: ['color', 'background-color', 'font-size', 'font-weight'],
      acceptableValues: {
        'color': ['#0000ff', '#00f', 'blue'],
        'background-color': ['#e3f2fd', '#e1f5fe', '#bbdefb'],
        'font-size': ['20px', '24px'],
        'font-weight': ['700', '600', 'bold']
      }
    },
    hints: [
      "Arrastra la propiedad 'color' y selecciona azul",
      "Agrega un 'background-color' azul claro",
      "Cambia el 'font-size' a 20px o más grande",
      "Haz el texto más grueso con 'font-weight'"
    ]
  },

  {
    id: 1,
    title: "Layout: Centrado y espaciado",
    description: "Aprende a centrar elementos y controlar el espaciado",
    html: `
      <div class="container">
        <div class="target-element">
          Elemento centrado
        </div>
      </div>
    `,
    baseCSS: `
      .container {
        width: 100%;
        height: 200px;
        border: 2px dashed #ccc;
        background: #f9f9f9;
      }
      
      .target-element {
        width: 150px;
        height: 60px;
        background: #3b82f6;
        color: white;
      }
    `,
    availableProperties: [
      'margin',
      'padding',
      'text-align',
      'display'
    ],
    expectedResult: {
      css: `
        .target-element {
          width: 150px;
          height: 60px;
          background: #3b82f6;
          color: white;
          margin: 24px auto;
          padding: 16px;
          text-align: center;
          display: block;
        }
      `,
      description: "Centra el elemento horizontalmente y el texto dentro de él"
    },
    validation: {
      requiredProperties: ['margin', 'text-align'],
      acceptableValues: {
        'margin': ['24px auto', '16px auto', 'auto'],
        'text-align': ['center']
      }
    },
    hints: [
      "Usa 'margin: auto' para centrar horizontalmente",
      "Usa 'text-align: center' para centrar el texto",
      "Agrega 'padding' para espacio interior",
      "Asegúrate de que 'display' sea 'block'"
    ]
  },

  {
    id: 2,
    title: "Bordes y formas",
    description: "Experimenta con bordes y border-radius",
    html: `
      <div class="target-element">
        Forma personalizada
      </div>
    `,
    baseCSS: `
      .target-element {
        width: 120px;
        height: 120px;
        background: #10b981;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        margin: 20px auto;
        box-sizing: border-box;
      }
    `,
    availableProperties: [
      'border',
      'border-radius',
      'width',
      'height',
      'margin',
      'display',
      'align-items',
      'justify-content'
    ],
    expectedResult: {
      css: `
        .target-element {
          width: 120px;
          height: 120px;
          background: #10b981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 20px auto;
          box-sizing: border-box;
          border: 3px solid #333;
          border-radius: 50%;
        }
      `,
      description: "Convierte el cuadrado en un círculo con borde grueso"
    },
    validation: {
      requiredProperties: ['border', 'border-radius'],
      acceptableValues: {
        'border': ['3px solid #333', '2px solid #000', '3px solid #000', '2px solid #333'],
        'border-radius': ['50%', '60px']
      }
    },
    hints: [
      "Usa 'border-radius: 50%' para hacer un círculo perfecto",
      "Agrega un borde grueso con 'border'",
      "Mantén width y height iguales para un círculo perfecto"
    ]
  },

  {
    id: 3,
    title: "Flexbox: Centrado avanzado",
    description: "Domina el centrado con Flexbox",
    html: `
      <div class="target-element">
        <div class="content">
          Centrado Perfecto
        </div>
      </div>
    `,
    baseCSS: `
      .target-element {
        width: 250px;
        height: 150px;
        background: #8b5cf6;
        color: white;
        border: 2px dashed rgba(255, 255, 255, 0.3);
        margin: 20px auto;
      }
      
      .content {
        font-weight: 500;
        font-size: 16px;
      }
    `,
    availableProperties: [
      'display',
      'align-items',
      'justify-content',
      'flex-direction',
      'text-align'
    ],
    expectedResult: {
      css: `
        .target-element {
          width: 250px;
          height: 150px;
          background: #8b5cf6;
          color: white;
          border: 2px dashed rgba(255, 255, 255, 0.3);
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .content {
          font-weight: 500;
          font-size: 16px;
        }
      `,
      description: "Centra el contenido perfectamente usando Flexbox"
    },
    validation: {
      requiredProperties: ['display', 'align-items', 'justify-content'],
      acceptableValues: {
        'display': ['flex'],
        'align-items': ['center'],
        'justify-content': ['center']
      }
    },
    hints: [
      "Usa 'display: flex' para crear un contenedor flexible",
      "Usa 'align-items: center' para centrar verticalmente",
      "Usa 'justify-content: center' para centrar horizontalmente",
      "Agrega 'text-align: center' para centrar el texto"
    ]
  },

  {
    id: 4,
    title: "Desafío final: Elemento estilizado",
    description: "Crea un elemento completo combinando todo lo aprendido",
    html: `
      <div class="target-element">
        ¡Desafío Final CSS!
        <br><br>
        Has completado todos los niveles básicos.
      </div>
    `,
    baseCSS: `
      .target-element {
        max-width: 300px;
        margin: 20px auto;
        padding: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    `,
    availableProperties: [
      'border',
      'border-radius',
      'font-size',
      'font-weight',
      'text-align',
      'margin',
      'padding'
    ],
    expectedResult: {
      css: `
        .target-element {
          max-width: 300px;
          margin: 20px auto;
          padding: 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
        }
      `,
      description: "Crea un elemento con bordes redondeados, texto centrado y estilizado"
    },
    validation: {
      requiredProperties: ['border', 'border-radius', 'font-size', 'font-weight', 'text-align'],
      acceptableValues: {
        'border': ['1px solid #e5e7eb', '1px solid #ccc', '2px solid #e5e7eb'],
        'border-radius': ['8px', '12px', '6px'],
        'font-size': ['20px', '18px', '24px'],
        'font-weight': ['700', '600', 'bold'],
        'text-align': ['center']
      }
    },
    hints: [
      "Agrega borde con 'border: 1px solid #e5e7eb'",
      "Redondea las esquinas con 'border-radius: 8px'",
      "Aumenta el tamaño del texto con 'font-size: 20px'",
      "Haz el texto más grueso con 'font-weight: 700'",
      "Centra el texto con 'text-align: center'"
    ]
  }
];