// Variables globales
let currentResult = null;
let currentProblemData = null;

// Inicializar partículas en el background
function initParticles() {
  const container = document.getElementById('particlesBg');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

function isNumberString(s) {
  return /^[-+]?\d*(\.\d+)?$/.test((s || '').toString().trim());
}

function makeObjective(n, existing) {
  const cont = document.createElement('div');
  cont.innerHTML = '<h4 style="color: var(--accent-light); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-bullseye"></i> Función Objetivo</h4>';

  const box = document.createElement('div');
  box.className = 'coeff-section';

  const title = document.createElement('div');
  title.className = 'coeff-section-title';
  title.innerHTML = '<i class="fas fa-function"></i> Coeficientes de Z';
  box.appendChild(title);

  const flex = document.createElement('div');
  flex.className = 'coeff-row';

  for (let i = 0; i < n; i++) {
    const val = existing && existing.c && existing.c[i] !== undefined ? existing.c[i] : '';
    const item = document.createElement('div');
    item.className = 'coeff-item';

    const varName = `x${i + 1}`;
    const lbl = document.createElement('label');
    lbl.textContent = varName;

    const input = document.createElement('input');
    input.name = `c_${i}`;
    input.type = 'number';
    input.inputMode = 'decimal';
    input.value = val;
    input.required = true;
    input.className = 'model-input';

    item.appendChild(lbl);
    item.appendChild(input);
    flex.appendChild(item);

    if (i < n - 1) {
      const plusSign = document.createElement('span');
      plusSign.textContent = '+';
      plusSign.className = 'math-separator';
      flex.appendChild(plusSign);
    }
  }
  box.appendChild(flex);
  cont.appendChild(box);
  return cont;
}

function makeConstraints(m, n, existing) {
  const cont = document.createElement('div');
  cont.innerHTML = '<h4 style="color: var(--accent-light); margin-top: 2rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-shield-alt"></i> Restricciones</h4>';

  for (let r = 0; r < m; r++) {
    const box = document.createElement('div');
    box.className = 'coeff-section';
    box.style.marginTop = '1rem';

    const title = document.createElement('div');
    title.className = 'coeff-section-title';
    title.innerHTML = `<i class="fas fa-grip-lines"></i> Restricción ${r + 1}`;
    box.appendChild(title);

    const row = document.createElement('div');
    row.className = 'coeff-row';

    for (let j = 0; j < n; j++) {
      const val = existing && existing.A && existing.A[r] && existing.A[r][j] !== undefined ? existing.A[r][j] : '';
      const item = document.createElement('div');
      item.className = 'coeff-item';

      const varName = `x${j + 1}`;
      const lbl = document.createElement('label');
      lbl.textContent = varName;

      const input = document.createElement('input');
      input.name = `a_${r}_${j}`;
      input.type = 'number';
      input.inputMode = 'decimal';
      input.value = val;
      input.required = true;
      input.className = 'model-input';

      item.appendChild(lbl);
      item.appendChild(input);
      row.appendChild(item);

      if (j < n - 1) {
        const plusSign = document.createElement('span');
        plusSign.textContent = '+';
        plusSign.className = 'math-separator';
        row.appendChild(plusSign);
      }
    }

    const existingSign = existing && existing.signs && existing.signs[r] ? existing.signs[r] : '<=';
    const signSel = document.createElement('div');
    signSel.className = 'form-group';
    signSel.style.minWidth = '120px';
    signSel.innerHTML = `
      <label><i class="fas fa-equals"></i> Relación</label>
      <select class="select-a" name="sign_${r}" class="model-input">
        <option value="<=" ${existingSign == '<=' ? 'selected' : ''}>&le;</option>
        <option value="=" ${existingSign == '=' ? 'selected' : ''}>=</option>
        <option value=">=" ${existingSign == '>=' ? 'selected' : ''}>&ge;</option>
      </select>
    `;
    row.appendChild(signSel);

    const valb = existing && existing.B && existing.B[r] !== undefined ? existing.B[r] : '';
    const rhs = document.createElement('div');
    rhs.className = 'form-group';
    rhs.style.minWidth = '150px';
    rhs.innerHTML = `
      <label><i class="fas fa-hashtag"></i> Lado Derecho</label>
      <input name="b_${r}" type="number" inputmode="decimal" value="${valb}" required class="model-input" />
    `;
    row.appendChild(rhs);

    box.appendChild(row);
    cont.appendChild(box);
  }
  return cont;
}

function generateForm(existing) {
  const n = parseInt(document.getElementById('nVars').value) || 0;
  const m = parseInt(document.getElementById('nRest').value) || 0;
  const area = document.getElementById('dynamicArea');
  const messages = document.getElementById('messages');
  area.innerHTML = '';
  messages.textContent = '';
  messages.className = 'alert alert-error';
  document.getElementById('modelPreview').style.display = 'none';

  if (n <= 0 || m <= 0) {
    messages.textContent = 'Las variables y restricciones deben ser enteros mayores a 0.';
    return;
  }
  if (n > 100 || m > 100) {
    messages.textContent = 'El número máximo de variables y restricciones es 100.';
    return;
  }

  area.appendChild(makeObjective(n, existing));
  area.appendChild(makeConstraints(m, n, existing));

  const inputs = document.querySelectorAll('#dynamicArea input, #dynamicArea select');
  inputs.forEach(input => input.addEventListener('input', throttleUpdate));

  updateModelDisplay();
}

function collectForm(silent = false) {
  const messagesEl = document.getElementById('messages');
  if (!silent) {
    messagesEl.textContent = '';
    messagesEl.className = 'alert alert-error';
  }

  const n = parseInt(document.getElementById('nVars').value) || 0;
  const m = parseInt(document.getElementById('nRest').value) || 0;
  const tipo = document.getElementById('tipo').value;
  const c = [], A = [], b = [], signs = [];

  if (n <= 0 || m <= 0) return null; 

  for (let i = 0; i < n; i++) {
    const el = document.querySelector(`[name="c_${i}"]`);
    if (!el) return null;
    const v = el.value;
    if (v.trim() === '') {
      if (!silent) messagesEl.textContent = `Complete el coeficiente x[${i + 1}]`;
      return null;
    }
    if (!isNumberString(v)) {
      if (!silent) messagesEl.textContent = `c[${i + 1}] debe ser numérico`;
      return null;
    }
    c.push(parseFloat(v));
  }

  for (let r = 0; r < m; r++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const sel = document.querySelector(`[name="a_${r}_${j}"]`);
      if (!sel) return null;
      const val = sel.value;
      const varName = `x${j + 1} de la Restricción ${r + 1}`;
      if (val.trim() === '') {
        if (!silent) messagesEl.textContent = `Complete el coeficiente de ${varName}`;
        return null;
      }
      if (!isNumberString(val)) {
        if (!silent) messagesEl.textContent = `El coeficiente de ${varName} debe ser numérico`;
        return null;
      }
      row.push(parseFloat(val));
    }
    A.push(row);

    const signEl = document.querySelector(`[name="sign_${r}"]`);
    if (!signEl) return null;
    const s = signEl.value;
    signs.push(s);

    const vbEl = document.querySelector(`[name="b_${r}"]`);
    if (!vbEl) return null;
    const vb = vbEl.value;
    if (vb.trim() === '') {
      if (!silent) messagesEl.textContent = `Complete el Lado derecho de la Restricción ${r + 1}`;
      return null;
    }
    if (!isNumberString(vb)) {
      if (!silent) messagesEl.textContent = `El Lado derecho debe ser numérico`;
      return null;
    }
    b.push(parseFloat(vb));
  }

  return { c, A, b, signs, maximize: tipo === 'max' };
}

function formatLP(data) {
  if (!data || data.c.length === 0) {
    return 'Esperando coeficientes para mostrar el modelo...';
  }

  const varNames = Array.from({ length: data.c.length }, (_, i) => `x${i + 1}`);
  const type = data.maximize ? 'Maximizar' : 'Minimizar';

  const objTerms = data.c.map((c, i) => {
    const val = Number(c).toPrecision(4);
    const cFloat = parseFloat(val);

    if (cFloat === 0) return '';

    const sign = cFloat > 0 ? '+' : '-';
    const absC = Math.abs(cFloat);
    const coeff = absC === 1 ? '' : absC.toString();

    return `${sign} ${coeff}${varNames[i]}`;
  }).filter(t => t !== '');

  let objective = objTerms.join(' ').trim();
  if (objective.startsWith('+')) {
    objective = objective.substring(1).trim();
  }
  if (objective === '') {
    objective = '0';
  }

  const constraints = data.A.map((row, r) => {
    const constTerms = row.map((a, i) => {
      const val = Number(a).toPrecision(4);
      const aFloat = parseFloat(val);

      if (aFloat === 0) return '';

      const sign = aFloat > 0 ? '+' : '-';
      const absA = Math.abs(aFloat);
      const coeff = absA === 1 ? '' : absA.toString();

      return `${sign} ${coeff}${varNames[i]}`;
    }).filter(t => t !== '');

    let constString = constTerms.join(' ').trim();
    if (constString.startsWith('+')) {
      constString = constString.substring(1).trim();
    }

    const signHtml = data.signs[r] === '<=' ? '≤' : data.signs[r] === '>=' ? '≥' : '=';
    const bValue = Number(data.b[r]).toPrecision(4);

    return `<span class="equation">${constString} ${signHtml} ${bValue}</span>`;
  }).join('');

  const nonNegativity = varNames.join(', ') + ' ≥ 0';

  return `
    <div class="model-title">
      <i class="fas fa-eye"></i> Vista Previa del Modelo Matemático
    </div>
    <p style="margin-top: 1rem; color: var(--text-secondary);"><strong>${type} Z:</strong></p>
    <span class="equation">Z = ${objective}</span>
    <p style="margin-top: 1rem; color: var(--text-secondary);"><strong>Sujeto a:</strong></p>
    <div style="padding-left: 1rem;">${constraints}</div>
    <p style="margin-top: 1rem; color: var(--text-secondary);"><strong>Restricción de no negatividad:</strong></p>
    <span class="equation">${nonNegativity}</span>
  `;
}

let updateTimeout = null;
function updateModelDisplay() {
  const data = collectForm(true);
  const previewEl = document.getElementById('modelPreview');

  const n = parseInt(document.getElementById('nVars').value) || 0;
  const m = parseInt(document.getElementById('nRest').value) || 0;

  if (n > 0 && m > 0 && data) {
    previewEl.innerHTML = formatLP(data);
    previewEl.style.display = 'block';
  } else {
    previewEl.style.display = 'none';
  }
}

function throttleUpdate() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(updateModelDisplay, 200);
}

async function submitForm() {
  const data = collectForm(false);
  if (!data) return;

  const messagesEl = document.getElementById('messages');
  const submitBtn = document.getElementById('submitBtn');
  const originalBtnText = submitBtn.innerHTML;
  
  messagesEl.className = 'alert alert-success';
  messagesEl.innerHTML = '<span class="spinner"></span> Resolviendo problema con método Simplex...';
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Resolviendo...';

  try {
    currentProblemData = data;
    const res = await fetch('/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        A: data.A, b: data.b, signs: data.signs, c: data.c, maximize: data.maximize
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error servidor' }));
      messagesEl.className = 'alert alert-error';
      messagesEl.textContent = err.error || 'Error en el servidor';
      return;
    }

    const json = await res.json();
    currentResult = json;
    showResult(json);
    
    messagesEl.textContent = '';
    messagesEl.className = 'alert alert-error';
  } catch (e) {
    messagesEl.className = 'alert alert-error';
    messagesEl.textContent = 'Error al comunicarse: ' + e.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
}

function showResult(res) {
  const area = document.getElementById('resultArea');
  const content = document.getElementById('resultContent');
  area.style.display = 'block';
  // const parts = []; // <-- ELIMINAMOS EL ARRAY 'parts'

// 1. Primero, limpia el contenido anterior
    content.innerHTML = ''; 

  if (res.Status) {
    // --- INICIO CORRECCIÓN ---
    // Creamos los elementos de forma segura en lugar de usar parts.push()
    const statusDiv = document.createElement('div');
    statusDiv.className = 'result-info';
    
    const statusP = document.createElement('p');
    statusP.innerHTML = '<strong>Estado:</strong> '; // Esto es seguro (es tu propio texto)
    
    const statusSpan = document.createElement('span');
    statusSpan.style = "color: var(--success-light);";
    statusSpan.textContent = res.Status; // <-- ¡LA FORMA SEGURA! Inserta datos como texto
    
    statusP.appendChild(statusSpan);
    statusDiv.appendChild(statusP);
    content.appendChild(statusDiv); // <-- Lo añadimos de forma segura al DOM
    // --- FIN CORRECCIÓN ---
  }

  if (res.Value !== undefined) {
    // --- INICIO CORRECCIÓN ---
    // Repetimos el mismo patrón seguro para el Valor
    const valueDiv = document.createElement('div');
    valueDiv.className = 'result-info';
    
    const valueP = document.createElement('p');
    valueP.innerHTML = '<strong>Valor Óptimo (Z):</strong> '; // Seguro
    
    const valueSpan = document.createElement('span');
    valueSpan.style = "color: var(--accent-light); font-size: 1.3rem; font-weight: 700;";
    valueSpan.textContent = Number(res.Value).toPrecision(4); // Seguro
    
    valueP.appendChild(valueSpan);
    valueDiv.appendChild(valueP);
    content.appendChild(valueDiv); // <-- Lo añadimos de forma segura al DOM
    // --- FIN CORRECCIÓN ---
  }

  // content.innerHTML = parts.join(''); // <-- LÍNEA PELIGROSA ELIMINADA

  // El resto de tu código ya era seguro y funciona perfecto
    if (res.X && Array.isArray(res.X)) {
        // --- Parte 1: El Título ---
        const title = document.createElement('h4');
        title.style = "color: var(--accent-light); margin-top: 1.5rem; margin-bottom: 1rem;";
        title.innerHTML = '<i class="fas fa-table"></i> Valores de las Variables:'; // Seguro (es texto estático)
        content.appendChild(title);

        // --- Parte 2: La Tabla ---
        const table = document.createElement('table');
        table.className = 'result-table';
        
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Variable</th><th>Valor</th></tr>'; // Seguro (es texto estático)
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        res.X.forEach((v, i) => {
            const tr = document.createElement('tr');
            
            // Celda 1 (Variable) - CORRECCIÓN DEFINITIVA
            const tdVar = document.createElement('td');
            const strongElement = document.createElement('strong');
            strongElement.textContent = `x${i + 1}`;
            tdVar.appendChild(strongElement);
            
            // Celda 2 (Valor)
            const tdVal = document.createElement('td');
            tdVal.textContent = Number(v).toPrecision(4); // 100% seguro
            
            tr.appendChild(tdVar);
            tr.appendChild(tdVal);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        content.appendChild(table);

    } else {
        const preElement = document.createElement('pre');
        preElement.textContent = JSON.stringify(res, null, 2); // 100% seguro
        content.appendChild(preElement);
    }    
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });

}



function generatePDF() {
    console.log(currentResult.Steps[0].Headers);
        if (!currentResult || !currentProblemData) {
            alert('No hay resultados para exportar');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                alert('Error: Biblioteca jsPDF no cargada');
                return;
            }
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let yPos = 20;
            const margin = 20;
            const maxWidth = pageWidth - 2 * margin;

            const checkAddPage = (yPosCheck) => {
                if (yPosCheck > pageHeight - 30) { 
                    doc.addPage();
                    return 20; 
                }
                return yPosCheck;
            };

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.setTextColor(45, 53, 97);
            doc.text('Calculadora Método Simplex', margin, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('Solución Óptima del Problema de Programación Lineal', margin, yPos);
            yPos += 15;

            doc.setDrawColor(99, 102, 241);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(6, 182, 212); 
            doc.text('1. Modelo Matemático', margin, yPos);
            yPos += 10;

            doc.setFont('courier', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const type = currentProblemData.maximize ? 'Maximizar' : 'Minimizar';
            doc.setFont('helvetica', 'bold');
            doc.text(`${type} Z:`, margin + 5, yPos);
            yPos += 7;

            doc.setFont('courier', 'normal');
            const varNames = Array.from({ length: currentProblemData.c.length }, (_, i) => `x${i + 1}`);
            let objStr = 'Z = ';
            const objTerms = currentProblemData.c.map((c, i) => {
                const cFloat = parseFloat(c);
                if (cFloat === 0) return '';
                const sign = cFloat > 0 ? '+' : '-';
                const absC = Math.abs(cFloat);
                const coeff = absC === 1 ? '' : absC.toString();
                return `${sign} ${coeff}${varNames[i]}`;
            }).filter(t => t !== '');

            if (objTerms.length > 0 && objTerms[0].startsWith('+')) {
                objStr += objTerms[0].substring(1).trim() + ' ' + objTerms.slice(1).join(' ');
            } else {
                objStr += objTerms.join(' ');
            }
            objStr = objStr.trim() || '0';

            const objLines = doc.splitTextToSize(objStr, maxWidth - 10);
            objLines.forEach(line => {
                doc.text(line, margin + 10, yPos);
                yPos += 6;
            });

            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.text('Sujeto a:', margin + 5, yPos);
            yPos += 7;

            doc.setFont('courier', 'normal');
            currentProblemData.A.forEach((row, r) => {
                const constTerms = row.map((a, i) => {
                    const aFloat = parseFloat(a);
                    if (aFloat === 0) return '';
                    const sign = aFloat > 0 ? '+' : '-';
                    const absA = Math.abs(aFloat);
                    const coeff = absA === 1 ? '' : absA.toString();
                    return `${sign} ${coeff}${varNames[i]}`;
                }).filter(t => t !== '');

                let constStr = constTerms.length > 0 && constTerms[0].startsWith('+')
                    ? constTerms[0].substring(1).trim() + ' ' + constTerms.slice(1).join(' ')
                    : constTerms.join(' ');
                constStr = constStr.trim() || '0';
                const sign = currentProblemData.signs[r];
                const bValue = Number(currentProblemData.b[r]).toPrecision(4);
                const constraintText = `${constStr} ${sign} ${bValue}`;

                const constLines = doc.splitTextToSize(constraintText, maxWidth - 10);
                constLines.forEach(line => {
                    doc.text(line, margin + 10, yPos);
                    yPos += 6;
                });
            });

            yPos += 5;
            doc.setFont('helvetica', 'bold');
            doc.text('Restricción de no negatividad:', margin + 5, yPos);
            yPos += 7;

            doc.setFont('courier', 'normal');
            const nonNegStr = varNames.join(', ') + ' >= 0';
            doc.text(nonNegStr, margin + 10, yPos);
            yPos += 15;

            yPos = checkAddPage(yPos);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(6, 182, 212);
            doc.text('2. Solución', margin, yPos);
            yPos += 10;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);

            if (currentResult.Status) {
                doc.setFont('helvetica', 'bold');
                doc.text('Estado: ', margin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(16, 185, 129); 
                doc.text(String(currentResult.Status || ""), margin + 25, yPos);
                doc.setTextColor(0, 0, 0);
                yPos += 10;
            }

            if (currentResult.Value !== undefined) {
                doc.setFont('helvetica', 'bold');
                doc.text('Valor Óptimo (Z): ', margin, yPos);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.setTextColor(6, 182, 212);
                doc.text(String(Number(currentResult.Value || 0).toPrecision(4)), margin + 50, yPos);
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);
                yPos += 12;
            }

            if (currentResult.X && Array.isArray(currentResult.X)) {
                yPos += 5;
                doc.setFont('helvetica', 'bold');
                doc.text('Valores de las Variables:', margin, yPos);
                yPos += 8;

                const tableWidth = pageWidth - 2*margin;
                const colWidth1 = tableWidth * 0.3;
                const colWidth2 = tableWidth * 0.7;
                
                doc.setFont('courier', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                doc.setFillColor(99, 102, 241); 
                doc.rect(margin, yPos, colWidth1, 7, 'F');
                doc.rect(margin + colWidth1, yPos, colWidth2, 7, 'F');
                doc.text('Variable', margin + colWidth1/2, yPos + 5);
                doc.text('Valor', margin + colWidth1 + colWidth2/2, yPos + 5);
                yPos += 7;
                
                doc.setTextColor(0, 0, 0);
                doc.setFillColor(255, 255, 255);
                currentResult.X.forEach((v, i) => {
                const valueStr = Number(v).toFixed(4).toString();
                doc.setFont('courier', 'normal');
                doc.setFillColor(255,255,255);
                doc.rect(margin, yPos, colWidth1, 6, 'FD');
                doc.rect(margin + colWidth1, yPos, colWidth2, 6, 'FD');
                doc.setTextColor(0, 0, 0);
                doc.text(`x${i + 1}`, margin + colWidth1/2, yPos + 4, {align: 'center'});
                doc.text(valueStr, margin + colWidth1 + colWidth2 / 2, yPos + 4, {align: 'center'});

                yPos += 6; 
                });
                yPos += 5;
            }

            doc.addPage();
            yPos = 20;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(6, 182, 212);
            doc.text('3. Paso a Paso', margin, yPos);
            yPos += 10;

            if (currentResult.Steps && Array.isArray(currentResult.Steps)) {
                currentResult.Steps.forEach((step, index) => {
                    
                    yPos = checkAddPage(yPos + 10); 

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    doc.setTextColor(0, 0, 0);
                    doc.text(step.Message, margin, yPos);
                    yPos += 8;

                    const headers = step.Headers;
                    if (typeof headers === "string") {
                    headers = headers.replace(/[\[\]]/g, "").trim().split(/\s+/);
                    }
                    const numCols = headers.length;
                    const tableWidth = pageWidth - 2*margin;
                    const colWidth = tableWidth / numCols;
                    const cellHeight = 5;

                    doc.setFont('courier', 'bold');
                    doc.setFontSize(8);
                    for (let c = 0; c < numCols; c++) {
                        doc.setTextColor(255, 255, 255);
                        doc.setFillColor(45, 53, 97);
                        doc.rect(margin + c * colWidth, yPos, colWidth, cellHeight, 'FD');
                        doc.text(headers[c], margin + c * colWidth + colWidth/2, yPos + 3.5);
                    }
                    yPos += cellHeight;
                    
                    doc.setFont('courier', 'normal');
                    doc.setFontSize(8);
                    step.Tableau.forEach(row => {
                        for (let c = 0; c < numCols; c++) {
                            const isLastCol = (c === numCols - 1);
                            if (isLastCol) {
                                doc.setFont('courier', 'bold');
                                doc.setFillColor(240, 240, 240);
                            } else {
                                doc.setFont('courier', 'normal');
                                doc.setFillColor(255, 255, 255);
                            }
                            doc.rect(margin + c * colWidth, yPos, colWidth, cellHeight, 'F');
                            doc.setTextColor(0, 0, 0);
                            const rawValue = row[c] ?? 0;
                            const valStr = Number(rawValue).toFixed(4).toString();
                            doc.text(valStr, margin + c * colWidth + colWidth / 2, yPos + 3.5, {align: 'center'});
                        }
                        yPos += cellHeight;
                    });
                    
                    yPos += 10;
                });
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text('No se registraron los pasos intermedios.', margin, yPos);
                yPos += 10;
            }

            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                const footerText = `${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;
                doc.text(footerText, margin, pageHeight - 10);
                doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
            }

            const fileName = `simplex_solucion_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar PDF: ' + error.message);
        }
    }

function resetForm() {
    document.getElementById('dynamicArea').innerHTML = '';
    document.getElementById('modelPreview').style.display = 'none';
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('messages').textContent = '';
    document.getElementById('nVars').value = '';
    document.getElementById('nRest').value = '';
    currentResult = null;
    currentProblemData = null;
}


function initApp() {
    initParticles(); 

    document.getElementById('generateBtn').addEventListener('click', () => generateForm());
    document.getElementById('clearBtn').addEventListener('click', resetForm);
    document.getElementById('submitBtn').addEventListener('click', submitForm);
    document.getElementById('downloadPdfBtn').addEventListener('click', generatePDF);
    document.getElementById('backBtn').addEventListener('click', resetForm); 

    window.generateForm = generateForm; 
    window.submitForm = submitForm;
    window.generatePDF = generatePDF;
    window.resetForm = resetForm;
}

document.addEventListener('DOMContentLoaded', initApp);