import { toast } from 'sonner';

export const generateNotificationMessage = (formData: any) => {
  const totalParts = formData.parts?.reduce((sum: number, part: any) => sum + (part.quantity * part.price), 0) || 0;
  const totalService = parseFloat(formData.maintenancePrice || 0) + totalParts;

  return `Hola ${formData.clientName || '[Cliente]'}, 

Te informamos que tu bicicleta ${formData.bikeBrand || '[Marca]'} ${formData.bikeModel || '[Modelo]'} ya está lista para ser retirada en nuestro taller.

Orden: ${formData.orderNumber || '[N° Orden]'}
Total a pagar: $${totalService.toLocaleString('es-CL')} CLP

¡Gracias por confiar en nosotros!`;
};

export const handleSendWhatsApp = (formData: any, customMessage?: string) => {
  if (!formData.phone) {
    toast.error('No hay número de teléfono registrado');
    return;
  }
  
  const message = encodeURIComponent(customMessage || generateNotificationMessage(formData));
  const phoneNumber = formData.phone.replace(/\D/g, '');
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  toast.success('Abriendo WhatsApp...');
};

export const handleSendEmail = (formData: any, customMessage?: string) => {
  if (!formData.email) {
    toast.error('No hay correo electrónico registrado');
    return;
  }
  
  const subject = encodeURIComponent(`Bicicleta lista para retiro - Orden ${formData.orderNumber || 'N/A'}`);
  const body = encodeURIComponent(customMessage || generateNotificationMessage(formData));
  window.open(`mailto:${formData.email}?subject=${subject}&body=${body}`, '_blank');
  toast.success('Abriendo cliente de correo...');
};

export const handlePrintLabel = (formData: any) => {
  const labelContent = `
    <html>
      <head>
        <title>Etiqueta - Orden ${formData.orderNumber}</title>
        <style>
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; padding: 10px; }
          }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            margin: 0;
            background: white;
          }
          .label {
            border: 2px solid #000;
            padding: 15px;
            max-width: 400px;
            margin: 0 auto;
          }
          .label-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .order-number {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .label-row {
            margin: 8px 0;
            font-size: 14px;
          }
          .label-title {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="label-header">
            <div style="font-size: 18px; font-weight: bold;">Taller de Bicicletas</div>
            <div class="order-number">ORDEN #${formData.orderNumber}</div>
          </div>
          <div class="label-row">
            <span class="label-title">Cliente:</span> ${formData.clientName || 'N/A'}
          </div>
          <div class="label-row">
            <span class="label-title">Teléfono:</span> ${formData.phone || 'N/A'}
          </div>
          <div class="label-row">
            <span class="label-title">Bicicleta:</span> ${formData.bikeBrand || 'N/A'} ${formData.bikeModel || ''}
          </div>
          <div class="label-row">
            <span class="label-title">Tipo:</span> ${formData.bikeType || 'N/A'}
          </div>
          <div class="label-row">
            <span class="label-title">Color:</span> ${formData.bikeColor || 'N/A'}
          </div>
          <div class="label-row">
            <span class="label-title">Mecánico:</span> ${formData.mechanic || 'N/A'}
          </div>
          <div class="label-row">
            <span class="label-title">Fecha Ingreso:</span> ${formData.entryDate || 'N/A'}
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank', 'width=600,height=400');
  if (printWindow) {
    printWindow.document.write(labelContent);
    printWindow.document.close();
  } else {
    toast.error('Bloqueador de ventanas emergentes activado', { description: 'Permite las ventanas emergentes para imprimir' });
  }
};

export const handlePrintVoucher = (formData: any) => {
  const totalParts = formData.parts?.reduce((sum: number, part: any) => sum + (part.quantity * part.price), 0) || 0;
  const totalService = parseFloat(formData.maintenancePrice || 0) + totalParts;

  const voucherContent = `
    <html>
      <head>
        <title>Voucher de Retiro - Orden ${formData.orderNumber}</title>
        <style>
          @media print {
            @page { margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            margin: 0;
            background: white;
          }
          .voucher {
            max-width: 700px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 30px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .order-num {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
            margin: 10px 0;
          }
          .section {
            margin: 20px 0;
            padding: 15px;
            background: #f9fafb;
            border-left: 4px solid #10b981;
          }
          .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            color: #1f2937;
          }
          .info-row {
            margin: 5px 0;
            font-size: 14px;
          }
          .total-box {
            background: #dcfce7;
            border: 2px solid #10b981;
            padding: 15px;
            margin-top: 20px;
            text-align: center;
          }
          .total-amount {
            font-size: 32px;
            font-weight: bold;
            color: #059669;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #d1d5db;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
            font-size: 13px;
          }
          th {
            background: #f3f4f6;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="voucher">
          <div class="header">
            <div class="title">VOUCHER DE RETIRO</div>
            <div style="font-size: 18px;">Sistema de Gestión - Taller de Bicicletas</div>
            <div class="order-num">ORDEN #${formData.orderNumber}</div>
            <div>Fecha: ${formData.entryDate || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">DATOS DEL CLIENTE</div>
            <div class="info-row"><strong>Nombre:</strong> ${formData.clientName || 'N/A'}</div>
            <div class="info-row"><strong>RUT:</strong> ${formData.rut || 'N/A'}</div>
            <div class="info-row"><strong>Teléfono:</strong> ${formData.phone || 'N/A'}</div>
            <div class="info-row"><strong>Email:</strong> ${formData.email || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">DATOS DE LA BICICLETA</div>
            <div class="info-row"><strong>Marca:</strong> ${formData.bikeBrand || 'N/A'}</div>
            <div class="info-row"><strong>Modelo:</strong> ${formData.bikeModel || 'N/A'}</div>
            <div class="info-row"><strong>Tipo:</strong> ${formData.bikeType || 'N/A'}</div>
            <div class="info-row"><strong>Color:</strong> ${formData.bikeColor || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">TRABAJO REALIZADO</div>
            <div class="info-row">${formData.workDetails?.replace(/\n/g, '<br>') || 'N/A'}</div>
            ${formData.parts?.length > 0 ? `
              <div style="margin-top: 15px;">
                <strong>Repuestos Utilizados:</strong>
                <table>
                  <thead>
                    <tr>
                      <th>Repuesto</th>
                      <th>Cantidad</th>
                      <th>Valor Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${formData.parts.map((part: any) => `
                      <tr>
                        <td>${part.name}</td>
                        <td>${part.quantity}</td>
                        <td>$${part.price.toLocaleString('es-CL')}</td>
                        <td>$${(part.quantity * part.price).toLocaleString('es-CL')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">COSTOS</div>
            <div class="info-row"><strong>Mantención:</strong> $${parseFloat(formData.maintenancePrice || 0).toLocaleString('es-CL')}</div>
            <div class="info-row"><strong>Repuestos:</strong> $${totalParts.toLocaleString('es-CL')}</div>
          </div>

          <div class="total-box">
            <div style="font-size: 18px; margin-bottom: 5px;">TOTAL A PAGAR</div>
            <div class="total-amount">$${totalService.toLocaleString('es-CL')} CLP</div>
          </div>

          <div class="footer">
            <p><strong>Mecánico:</strong> ${formData.mechanic || 'N/A'}</p>
            <p>Gracias por confiar en nuestro taller. ¡Esperamos verte pronto!</p>
            <br/><br/>
            <p>______________________________________</p>
            <p>Firma del Cliente</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(voucherContent);
    printWindow.document.close();
  } else {
    toast.error('Bloqueador de ventanas emergentes activado', { description: 'Permite las ventanas emergentes para imprimir' });
  }
};
