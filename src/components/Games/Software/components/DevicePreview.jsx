import React, { useRef, useEffect } from 'react';
import styles from './DevicePreview.module.css';

export function DevicePreview({ 
  css, 
  html, 
  deviceType, 
  expectedResult, 
  showExpected 
}) {
  const previewRef = useRef(null);
  const expectedRef = useRef(null);

  const updatePreview = (ref, htmlContent, cssContent) => {
    if (!ref.current) return;

    const doc = ref.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .container {
            width: 100%;
            max-width: 400px;
          }
          
          ${cssContent}
        </style>
      </head>
      <body>
        <div class="container">
          ${htmlContent}
        </div>
      </body>
      </html>
    `);
    doc.close();
  };

  useEffect(() => {
    updatePreview(previewRef, html, css);
  }, [html, css]);

  useEffect(() => {
    if (showExpected && expectedResult) {
      updatePreview(expectedRef, html, expectedResult.css || '');
    }
  }, [html, expectedResult, showExpected]);

  return (
    <div className={styles.devicePreview}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {deviceType === 'web' ? '🖥️ Vista Web' : '📱 Vista Móvil'}
        </h3>
        {showExpected && expectedResult && (
          <span className={styles.comparison}>
            Resultado vs Esperado
          </span>
        )}
      </div>

      <div className={styles.previewContainer}>
        {/* Preview actual */}
        <div className={styles.previewWrapper}>
          <div className={styles.previewLabel}>Tu resultado</div>
          <div className={`${styles.deviceFrame} ${styles[deviceType]}`}>
            <div className={styles.deviceScreen}>
              <iframe
                ref={previewRef}
                className={styles.previewFrame}
                title="Vista previa actual"
                sandbox="allow-same-origin"
              />
            </div>
            {deviceType === 'mobile' && (
              <div className={styles.deviceControls}>
                <div className={styles.homeButton}></div>
              </div>
            )}
          </div>
        </div>

        {/* Preview esperado */}
        {showExpected && expectedResult && (
          <div className={styles.previewWrapper}>
            <div className={styles.previewLabel}>Resultado esperado</div>
            <div className={`${styles.deviceFrame} ${styles[deviceType]} ${styles.expected}`}>
              <div className={styles.deviceScreen}>
                <iframe
                  ref={expectedRef}
                  className={styles.previewFrame}
                  title="Vista previa esperada"
                  sandbox="allow-same-origin"
                />
              </div>
              {deviceType === 'mobile' && (
                <div className={styles.deviceControls}>
                  <div className={styles.homeButton}></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {expectedResult?.description && (
        <div className={styles.objectiveDescription}>
          <div className={styles.objectiveHeader}>
            <span className={styles.objectiveIcon}>🎯</span>
            <span className={styles.objectiveTitle}>Objetivo:</span>
          </div>
          <p className={styles.objectiveText}>
            {expectedResult.description}
          </p>
        </div>
      )}
    </div>
  );
}