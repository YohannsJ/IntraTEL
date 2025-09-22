import React, { useState } from 'react';
import { CSS_PROPERTIES } from '../config/cssProperties.js';
import styles from './ElementLibrary.module.css';

export function ElementLibrary({ level, onPropertyDrop, showHints }) {
  const [selectedCategory, setSelectedCategory] = useState('layout');
  const [draggedProperty, setDraggedProperty] = useState(null);

  const categories = Object.keys(CSS_PROPERTIES);
  const availableProperties = level?.availableProperties || [];
  
  // Filtrar propiedades según el nivel actual
  const getFilteredProperties = (category) => {
    const categoryProperties = CSS_PROPERTIES[category] || [];
    return categoryProperties.filter(prop => 
      availableProperties.length === 0 || 
      availableProperties.includes(prop.property)
    );
  };

  const handleDragStart = (property, value) => {
    setDraggedProperty({ property, value });
  };

  const handleDragEnd = () => {
    setDraggedProperty(null);
  };

  const handlePropertyClick = (property, value) => {
    // Alternativa para dispositivos táctiles
    onPropertyDrop(property, value);
  };

  const renderPropertyValue = (property) => {
    if (Array.isArray(property.values)) {
      return (
        <div className={styles.propertyValues}>
          {property.values.map((value, index) => (
            <div
              key={index}
              className={styles.propertyValue}
              draggable
              onDragStart={() => handleDragStart(property.property, value.value)}
              onDragEnd={handleDragEnd}
              onClick={() => handlePropertyClick(property.property, value.value)}
              title={value.description}
            >
              <span className={styles.valueName}>{value.name}</span>
              <span className={styles.valueCode}>{value.value}</span>
              {value.preview && (
                <div 
                  className={styles.valuePreview}
                  style={value.preview}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // Valor simple
    return (
      <div
        className={styles.propertyValue}
        draggable
        onDragStart={() => handleDragStart(property.property, property.defaultValue)}
        onDragEnd={handleDragEnd}
        onClick={() => handlePropertyClick(property.property, property.defaultValue)}
      >
        <span className={styles.valueCode}>{property.defaultValue}</span>
      </div>
    );
  };

  return (
    <div className={styles.elementLibrary}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          🎨 Biblioteca CSS
        </h3>
        <div className={styles.helpText}>
          Arrastra propiedades al área de código
        </div>
      </div>

      <div className={styles.categories}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.active : ''
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryIcon(category)} {getCategoryName(category)}
          </button>
        ))}
      </div>

      <div className={styles.propertiesContainer}>
        {getFilteredProperties(selectedCategory).map((property) => (
          <div key={property.property} className={styles.propertyGroup}>
            <div className={styles.propertyHeader}>
              <span className={styles.propertyName}>
                {property.property}
              </span>
              {showHints && property.description && (
                <span className={styles.propertyDescription}>
                  {property.description}
                </span>
              )}
            </div>
            
            {renderPropertyValue(property)}
            
            {showHints && property.example && (
              <div className={styles.propertyExample}>
                <span className={styles.exampleLabel}>Ejemplo:</span>
                <code className={styles.exampleCode}>
                  {property.property}: {property.example};
                </code>
              </div>
            )}
          </div>
        ))}
        
        {getFilteredProperties(selectedCategory).length === 0 && (
          <div className={styles.emptyCategory}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyText}>
              No hay propiedades disponibles en esta categoría para el nivel actual
            </p>
          </div>
        )}
      </div>

      {draggedProperty && (
        <div className={styles.dragIndicator}>
          <div className={styles.dragPreview}>
            {draggedProperty.property}: {draggedProperty.value}
          </div>
          <div className={styles.dragHint}>
            Suelta en el área de código para agregar
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    layout: '📐',
    colors: '🎨',
    typography: '📝',
    spacing: '📏',
    borders: '🔲',
    transforms: '🔄',
    animation: '✨'
  };
  return icons[category] || '🔧';
}

function getCategoryName(category) {
  const names = {
    layout: 'Layout',
    colors: 'Colores',
    typography: 'Texto',
    spacing: 'Espaciado',
    borders: 'Bordes',
    transforms: 'Transformaciones',
    animation: 'Animaciones'
  };
  return names[category] || category;
}