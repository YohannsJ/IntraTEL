export const CSS_PROPERTIES = {
  layout: [
    {
      property: 'display',
      description: 'Define cómo se muestra un elemento',
      values: [
        { name: 'Bloque', value: 'block', description: 'Elemento de bloque, ocupa toda la línea' },
        { name: 'En línea', value: 'inline', description: 'Elemento en línea, fluye con el texto' },
        { name: 'Flex', value: 'flex', description: 'Contenedor flexible' },
        { name: 'Grid', value: 'grid', description: 'Contenedor de cuadrícula' },
        { name: 'Ninguno', value: 'none', description: 'Oculta el elemento' }
      ],
      example: 'flex'
    },
    {
      property: 'position',
      description: 'Define el método de posicionamiento',
      values: [
        { name: 'Estático', value: 'static', description: 'Posición normal' },
        { name: 'Relativo', value: 'relative', description: 'Relativo a su posición normal' },
        { name: 'Absoluto', value: 'absolute', description: 'Relativo al contenedor posicionado' },
        { name: 'Fijo', value: 'fixed', description: 'Relativo a la ventana' }
      ],
      example: 'relative'
    },
    {
      property: 'float',
      description: 'Hace que un elemento flote a la izquierda o derecha',
      values: [
        { name: 'Izquierda', value: 'left', description: 'Flota a la izquierda' },
        { name: 'Derecha', value: 'right', description: 'Flota a la derecha' },
        { name: 'Ninguno', value: 'none', description: 'No flota' }
      ],
      example: 'left'
    },
    {
      property: 'align-items',
      description: 'Alineación vertical en flexbox',
      values: [
        { name: 'Inicio', value: 'flex-start', description: 'Alinea al inicio' },
        { name: 'Centro', value: 'center', description: 'Centra verticalmente' },
        { name: 'Final', value: 'flex-end', description: 'Alinea al final' },
        { name: 'Estirar', value: 'stretch', description: 'Estira para llenar' }
      ],
      example: 'center'
    },
    {
      property: 'justify-content',
      description: 'Alineación horizontal en flexbox',
      values: [
        { name: 'Inicio', value: 'flex-start', description: 'Alinea al inicio' },
        { name: 'Centro', value: 'center', description: 'Centra horizontalmente' },
        { name: 'Final', value: 'flex-end', description: 'Alinea al final' },
        { name: 'Espacio entre', value: 'space-between', description: 'Espacio entre elementos' },
        { name: 'Espacio alrededor', value: 'space-around', description: 'Espacio alrededor de elementos' }
      ],
      example: 'center'
    }
  ],

  colors: [
    {
      property: 'color',
      description: 'Color del texto',
      values: [
        { name: 'Rojo', value: '#ff0000', description: 'Texto rojo', preview: { backgroundColor: '#ff0000' } },
        { name: 'Azul', value: '#0000ff', description: 'Texto azul', preview: { backgroundColor: '#0000ff' } },
        { name: 'Verde', value: '#00ff00', description: 'Texto verde', preview: { backgroundColor: '#00ff00' } },
        { name: 'Negro', value: '#000000', description: 'Texto negro', preview: { backgroundColor: '#000000' } },
        { name: 'Blanco', value: '#ffffff', description: 'Texto blanco', preview: { backgroundColor: '#ffffff', border: '1px solid #ccc' } }
      ],
      example: '#3b82f6'
    },
    {
      property: 'background-color',
      description: 'Color de fondo del elemento',
      values: [
        { name: 'Rojo claro', value: '#ffebee', description: 'Fondo rojo claro', preview: { backgroundColor: '#ffebee' } },
        { name: 'Azul claro', value: '#e3f2fd', description: 'Fondo azul claro', preview: { backgroundColor: '#e3f2fd' } },
        { name: 'Verde claro', value: '#e8f5e8', description: 'Fondo verde claro', preview: { backgroundColor: '#e8f5e8' } },
        { name: 'Amarillo', value: '#fff3e0', description: 'Fondo amarillo', preview: { backgroundColor: '#fff3e0' } },
        { name: 'Gris', value: '#f5f5f5', description: 'Fondo gris', preview: { backgroundColor: '#f5f5f5' } }
      ],
      example: '#f0f9ff'
    }
  ],

  typography: [
    {
      property: 'font-size',
      description: 'Tamaño de la fuente',
      values: [
        { name: 'Pequeño', value: '12px', description: 'Texto pequeño' },
        { name: 'Normal', value: '16px', description: 'Texto normal' },
        { name: 'Grande', value: '20px', description: 'Texto grande' },
        { name: 'Muy grande', value: '24px', description: 'Texto muy grande' },
        { name: 'Gigante', value: '32px', description: 'Texto gigante' }
      ],
      example: '18px'
    },
    {
      property: 'font-weight',
      description: 'Grosor de la fuente',
      values: [
        { name: 'Ligero', value: '300', description: 'Texto ligero' },
        { name: 'Normal', value: '400', description: 'Texto normal' },
        { name: 'Medio', value: '500', description: 'Texto medio' },
        { name: 'Negrita', value: '700', description: 'Texto en negrita' },
        { name: 'Muy negrita', value: '900', description: 'Texto muy negrita' }
      ],
      example: '600'
    },
    {
      property: 'text-align',
      description: 'Alineación del texto',
      values: [
        { name: 'Izquierda', value: 'left', description: 'Alineado a la izquierda' },
        { name: 'Centro', value: 'center', description: 'Centrado' },
        { name: 'Derecha', value: 'right', description: 'Alineado a la derecha' },
        { name: 'Justificado', value: 'justify', description: 'Texto justificado' }
      ],
      example: 'center'
    }
  ],

  spacing: [
    {
      property: 'margin',
      description: 'Espacio exterior del elemento',
      values: [
        { name: 'Sin margen', value: '0', description: 'Sin espacio exterior' },
        { name: 'Pequeño', value: '8px', description: 'Margen pequeño' },
        { name: 'Mediano', value: '16px', description: 'Margen mediano' },
        { name: 'Grande', value: '24px', description: 'Margen grande' },
        { name: 'Muy grande', value: '32px', description: 'Margen muy grande' },
        { name: 'Centrar horizontal', value: 'auto', description: 'Centra horizontalmente' },
        { name: 'Centrar 16px', value: '16px auto', description: 'Margen vertical 16px, centrado horizontal' },
        { name: 'Centrar 20px', value: '20px auto', description: 'Margen vertical 20px, centrado horizontal' },
        { name: 'Centrar 24px', value: '24px auto', description: 'Margen vertical 24px, centrado horizontal' }
      ],
      example: '16px'
    },
    {
      property: 'padding',
      description: 'Espacio interior del elemento',
      values: [
        { name: 'Sin relleno', value: '0', description: 'Sin espacio interior' },
        { name: 'Pequeño', value: '8px', description: 'Relleno pequeño' },
        { name: 'Mediano', value: '16px', description: 'Relleno mediano' },
        { name: 'Grande', value: '24px', description: 'Relleno grande' },
        { name: 'Muy grande', value: '32px', description: 'Relleno muy grande' }
      ],
      example: '12px'
    }
  ],

  borders: [
    {
      property: 'border',
      description: 'Borde del elemento',
      values: [
        { name: 'Sin borde', value: 'none', description: 'Sin borde' },
        { name: 'Fino gris claro', value: '1px solid #e5e7eb', description: 'Borde fino gris claro (ideal para tarjetas)' },
        { name: 'Fino gris', value: '1px solid #ccc', description: 'Borde fino gris' },
        { name: 'Fino dos', value: '2px solid #e5e7eb', description: 'Borde fino de 2px gris claro' },
        { name: 'Mediano negro', value: '2px solid #000', description: 'Borde mediano negro' },
        { name: 'Grueso oscuro', value: '3px solid #333', description: 'Borde grueso oscuro (ideal para formas)' },
        { name: 'Grueso negro', value: '3px solid #000', description: 'Borde grueso negro' },
        { name: 'Punteado', value: '2px dotted #666', description: 'Borde punteado' }
      ],
      example: '1px solid #e5e7eb'
    },
    {
      property: 'border-radius',
      description: 'Redondez de las esquinas',
      values: [
        { name: 'Sin redondez', value: '0', description: 'Esquinas cuadradas' },
        { name: 'Poco redondeado', value: '4px', description: 'Esquinas ligeramente redondeadas' },
        { name: 'Suave', value: '6px', description: 'Esquinas suavemente redondeadas' },
        { name: 'Redondeado', value: '8px', description: 'Esquinas redondeadas (ideal para tarjetas)' },
        { name: 'Más redondeado', value: '12px', description: 'Esquinas más redondeadas' },
        { name: 'Muy redondeado', value: '16px', description: 'Esquinas muy redondeadas' },
        { name: 'Círculo perfecto', value: '50%', description: 'Convierte en círculo perfecto' },
        { name: 'Circular 60px', value: '60px', description: 'Muy redondeado con 60px' }
      ],
      example: '8px'
    }
  ],

  transforms: [
    {
      property: 'width',
      description: 'Ancho del elemento',
      values: [
        { name: 'Automático', value: 'auto', description: 'Ancho automático' },
        { name: 'Pequeño', value: '100px', description: 'Ancho pequeño' },
        { name: 'Normal', value: '120px', description: 'Ancho normal para formas' },
        { name: 'Mediano', value: '200px', description: 'Ancho mediano' },
        { name: 'Grande', value: '300px', description: 'Ancho grande' },
        { name: 'Completo', value: '100%', description: 'Ancho completo' }
      ],
      example: '250px'
    },
    {
      property: 'height',
      description: 'Alto del elemento',
      values: [
        { name: 'Automático', value: 'auto', description: 'Alto automático' },
        { name: 'Pequeño', value: '50px', description: 'Alto pequeño' },
        { name: 'Mediano', value: '100px', description: 'Alto mediano' },
        { name: 'Normal', value: '120px', description: 'Alto normal para formas' },
        { name: 'Grande', value: '150px', description: 'Alto grande' },
        { name: 'Muy grande', value: '200px', description: 'Alto muy grande' }
      ],
      example: '120px'
    }
  ]
};