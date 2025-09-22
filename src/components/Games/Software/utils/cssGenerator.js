// Generador y validador de CSS para el juego

export function generateCSS(cssProperties, baseCSS = '') {
  let generatedCSS = baseCSS + '\n\n';
  
  Object.entries(cssProperties).forEach(([selector, properties]) => {
    generatedCSS += `${selector} {\n`;
    Object.entries(properties).forEach(([property, value]) => {
      generatedCSS += `  ${property}: ${value};\n`;
    });
    generatedCSS += '}\n\n';
  });
  
  return generatedCSS.trim();
}

export function validateLevel(cssProperties, level) {
  if (!level || !level.validation) {
    return false;
  }
  
  const { requiredProperties, acceptableValues } = level.validation;
  
  // Obtener todas las propiedades aplicadas (de todos los selectores)
  const appliedProperties = {};
  Object.values(cssProperties).forEach(selectorProps => {
    Object.entries(selectorProps).forEach(([property, value]) => {
      appliedProperties[property] = value;
    });
  });
  
  // Verificar que todas las propiedades requeridas estén presentes
  for (const requiredProp of requiredProperties) {
    if (!appliedProperties[requiredProp]) {
      console.log(`Falta la propiedad requerida: ${requiredProp}`);
      return false;
    }
  }
  
  // Verificar que los valores sean aceptables
  if (acceptableValues) {
    for (const [property, acceptableValuesList] of Object.entries(acceptableValues)) {
      const appliedValue = appliedProperties[property];
      if (appliedValue && !acceptableValuesList.includes(appliedValue)) {
        console.log(`Valor no aceptable para ${property}: ${appliedValue}`);
        return false;
      }
    }
  }
  
  return true;
}

export function getCSSPropertyHelp(property) {
  const helpTexts = {
    'display': 'Controla cómo se muestra un elemento. "flex" crea un contenedor flexible, "block" hace que ocupe toda la línea.',
    'color': 'Define el color del texto. Puedes usar nombres (red, blue) o códigos hex (#ff0000).',
    'background-color': 'Establece el color de fondo del elemento.',
    'font-size': 'Controla el tamaño del texto. Se puede especificar en píxeles (px) o otras unidades.',
    'font-weight': 'Define qué tan grueso o delgado aparece el texto. 400 es normal, 700 es negrita.',
    'text-align': 'Controla la alineación horizontal del texto dentro de su contenedor.',
    'margin': 'Espacio exterior alrededor del elemento. "auto" puede centrar elementos horizontalmente.',
    'padding': 'Espacio interior dentro del elemento, entre el contenido y el borde.',
    'border': 'Crea un borde alrededor del elemento. Formato: grosor estilo color.',
    'border-radius': 'Redondea las esquinas del elemento. 50% crea un círculo perfecto.',
    'width': 'Define el ancho del elemento.',
    'height': 'Define la altura del elemento.',
    'position': 'Controla el método de posicionamiento del elemento.',
    'float': 'Hace que un elemento flote a la izquierda o derecha del contenido.'
  };
  
  return helpTexts[property] || 'Propiedad CSS que modifica la apariencia del elemento.';
}

export function formatCSSForDisplay(cssText) {
  // Limpia y formatea el CSS para una mejor visualización
  return cssText
    .replace(/\s+/g, ' ')
    .replace(/\{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/\s*\}/g, '\n}')
    .replace(/,\s*/g, ',\n');
}

export function validateCSSValue(property, value) {
  // Validaciones básicas para valores CSS
  const validations = {
    'color': (val) => /^(#[0-9a-fA-F]{3,6}|[a-zA-Z]+|\w+\([^)]*\))$/.test(val),
    'background-color': (val) => /^(#[0-9a-fA-F]{3,6}|[a-zA-Z]+|\w+\([^)]*\))$/.test(val),
    'font-size': (val) => /^\d+(px|em|rem|%|pt)$/.test(val),
    'font-weight': (val) => /^(normal|bold|\d{3})$/.test(val),
    'margin': (val) => /^(\d+(px|em|rem|%)|auto)(\s+(\d+(px|em|rem|%)|auto))*$/.test(val),
    'padding': (val) => /^\d+(px|em|rem|%)(\s+\d+(px|em|rem|%))*$/.test(val),
    'width': (val) => /^(\d+(px|em|rem|%)|auto)$/.test(val),
    'height': (val) => /^(\d+(px|em|rem|%)|auto)$/.test(val),
    'border-radius': (val) => /^(\d+(px|em|rem|%))(\s+\d+(px|em|rem|%))*$/.test(val)
  };
  
  const validator = validations[property];
  return validator ? validator(value) : true; // Si no hay validador específico, asumir válido
}

export function getPropertySuggestions(property) {
  const suggestions = {
    'display': ['block', 'inline', 'flex', 'grid', 'none'],
    'position': ['static', 'relative', 'absolute', 'fixed'],
    'text-align': ['left', 'center', 'right', 'justify'],
    'font-weight': ['300', '400', '500', '600', '700', '800', '900'],
    'color': ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
    'background-color': ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0']
  };
  
  return suggestions[property] || [];
}