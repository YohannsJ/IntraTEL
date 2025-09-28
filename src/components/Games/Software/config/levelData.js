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
      }
    `,
    availableProperties: [
      'border',
      'border-radius',
      'width',
      'height'
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
          border: 3px solid #333;
          border-radius: 50%;
        }
      `,
      description: "Convierte el cuadrado en un círculo con borde grueso"
    },
    validation: {
      requiredProperties: ['border', 'border-radius'],
      acceptableValues: {
        'border': ['3px solid #333', '2px solid #000', '3px solid #000'],
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
    title: "Layout flexbox",
    description: "Aprende los conceptos básicos de flexbox",
    html: `
      <div class="container">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      </div>
    `,
    baseCSS: `
      .container {
        width: 100%;
        height: 150px;
        background: #f3f4f6;
        border: 2px solid #d1d5db;
      }
      
      .item {
        width: 60px;
        height: 60px;
        background: #8b5cf6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin: 5px;
      }
    `,
    availableProperties: [
      'display',
      'margin',
      'padding'
    ],
    expectedResult: {
      css: `
        .container {
          width: 100%;
          height: 150px;
          background: #f3f4f6;
          border: 2px solid #d1d5db;
          display: flex;
          padding: 16px;
        }
      `,
      description: "Convierte el contenedor en flexbox para organizar los elementos horizontalmente"
    },
    validation: {
      requiredProperties: ['display'],
      acceptableValues: {
        'display': ['flex']
      }
    },
    hints: [
      "Usa 'display: flex' en el contenedor",
      "Agrega padding al contenedor para separación",
      "Los elementos se organizarán horizontalmente automáticamente"
    ]
  },

  {
    id: 4,
    title: "Desafío final: Tarjeta completa",
    description: "Crea una tarjeta estilizada combinando todo lo aprendido",
    html: `
      <div class="card">
        <div class="card-header">
          Tarjeta CSS
        </div>
        <div class="card-content">
          Esta es una tarjeta creada con CSS. Combina colores, espaciado, bordes y tipografía.
        </div>
      </div>
    `,
    baseCSS: `
      .card {
        max-width: 300px;
        margin: 20px auto;
      }
      
      .card-header {
        background: #1f2937;
        color: white;
        padding: 16px;
      }
      
      .card-content {
        background: white;
        padding: 16px;
        color: #374151;
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
        .card {
          max-width: 300px;
          margin: 20px auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .card-header {
          background: #1f2937;
          color: white;
          padding: 16px;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
        }
        
        .card-content {
          background: white;
          padding: 16px;
          color: #374151;
        }
      `,
      description: "Crea una tarjeta con bordes redondeados, header centrado y estilizado"
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
      "Agrega borde y border-radius a la tarjeta principal",
      "Estiliza el header con font-size y font-weight",
      "Centra el texto del header con text-align",
      "Experimenta con diferentes valores de padding y margin"
    ]
  }
];