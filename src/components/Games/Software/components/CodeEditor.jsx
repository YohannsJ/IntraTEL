import React, { useState } from 'react';
import styles from './CodeEditor.module.css';

export function CodeEditor({ 
  cssProperties, 
  generatedCSS, 
  onRemoveProperty, 
  onClearAll, 
  level 
}) {
  const [showGenerated, setShowGenerated] = useState(false);

  const formatCSSProperties = () => {
    const formatted = [];
    
    Object.entries(cssProperties).forEach(([selector, properties]) => {
      formatted.push(`${selector} {`);
      Object.entries(properties).forEach(([property, value]) => {
        formatted.push(`  ${property}: ${value};`);
      });
      formatted.push(`}`);
      formatted.push('');
    });
    
    return formatted.join('\n');
  };

  const handlePropertyRemove = (selector, property) => {
    onRemoveProperty(selector, property);
  };

  return (
    <div className={styles.codeEditor}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Editor CSS
        </h3>
        <div className={styles.controls}>
          <button
            className={`${styles.toggleButton} ${!showGenerated ? styles.active : ''}`}
            onClick={() => setShowGenerated(false)}
          >
            📝 Propiedades
          </button>
          <button
            className={`${styles.toggleButton} ${showGenerated ? styles.active : ''}`}
            onClick={() => setShowGenerated(true)}
          >
            🔍 CSS Generado
          </button>
          {Object.keys(cssProperties).length > 0 && (
            <button
              className={styles.clearButton}
              onClick={onClearAll}
              title="Limpiar todas las propiedades"
            >
              🗑️ Limpiar
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {!showGenerated ? (
          <div className={styles.propertiesView}>
            {Object.keys(cssProperties).length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎨</div>
                <p className={styles.emptyText}>
                  Arrastra propiedades CSS desde la biblioteca
                </p>
                <p className={styles.emptySubtext}>
                  Las propiedades aparecerán aquí cuando las agregues
                </p>
              </div>
            ) : (
              <div className={styles.selectorsList}>
                {Object.entries(cssProperties).map(([selector, properties]) => (
                  <div key={selector} className={styles.selectorBlock}>
                    <div className={styles.selectorHeader}>
                      <span className={styles.selectorName}>{selector}</span>
                      <span className={styles.selectorBrace}>{'{'}</span>
                    </div>
                    
                    <div className={styles.propertiesList}>
                      {Object.entries(properties).map(([property, value]) => (
                        <div key={property} className={styles.propertyRow}>
                          <span className={styles.property}>{property}:</span>
                          <span className={styles.value}>{value};</span>
                          <button
                            className={styles.removePropertyButton}
                            onClick={() => handlePropertyRemove(selector, property)}
                            title="Eliminar propiedad"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.selectorFooter}>
                      <span className={styles.selectorBrace}>{'}'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.generatedView}>
            <pre className={styles.codeBlock}>
              <code>{generatedCSS || '/* No hay CSS generado aún */'}</code>
            </pre>
          </div>
        )}
      </div>

      {level?.hints && (
        <div className={styles.hints}>
          <div className={styles.hintsHeader}>
            <span className={styles.hintsIcon}>💡</span>
            <span className={styles.hintsTitle}>Pistas para este nivel:</span>
          </div>
          <ul className={styles.hintsList}>
            {level.hints.map((hint, index) => (
              <li key={index} className={styles.hint}>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}