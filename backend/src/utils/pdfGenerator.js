const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

class PDFGenerator {
    /**
     * Generate a Schooling Certificate
     */
    static async generateSchoolingCertificate(data, verificationUrl) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: `Schooling Certificate - ${data.student_name}`,
                        Author: 'UPF Smart Management System',
                    }
                });

                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // --- Header / Logo Area ---
                // (Using text since we don't have a logo file path confirmed)
                doc.fillColor('#1a1a1a')
                    .fontSize(24)
                    .font('Helvetica-Bold')
                    .text('UPF UNIVERSITY', { align: 'center' });

                doc.fontSize(10)
                    .font('Helvetica')
                    .text('Advanced Academic Management System', { align: 'center' });

                doc.moveDown(1);
                doc.strokeColor('#e5e7eb').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(2);

                // --- Title ---
                doc.fillColor('#111827')
                    .fontSize(20)
                    .font('Helvetica-Bold')
                    .text('SCHOOLING CERTIFICATE', { align: 'center', underline: true });

                doc.moveDown(2);

                // --- Body Content ---
                doc.fontSize(12)
                    .font('Helvetica')
                    .fillColor('#374151')
                    .lineGap(8);

                const currentDate = new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                doc.text('The Administration of UPF University hereby certifies that:', { align: 'left' });
                doc.moveDown(0.5);

                doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827')
                    .text(`Mr./Ms. ${data.student_name.toUpperCase()}`, { indent: 20 });

                doc.fontSize(12).font('Helvetica').fillColor('#374151')
                    .text(`Student ID: ${data.registration_num}`, { indent: 20 })
                    .text(`Born on: ${data.birth_date ? new Date(data.birth_date).toLocaleDateString() : 'N/A'}`, { indent: 20 });

                doc.moveDown(1);
                doc.text(`Is regularly enrolled for the academic year `, { continued: true })
                    .font('Helvetica-Bold').text(data.academic_year, { continued: true })
                    .font('Helvetica').text(` in the following program:`);

                doc.moveDown(0.5);
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827')
                    .text(data.speciality_name, { align: 'center' });

                doc.moveDown(2);
                doc.fontSize(12).font('Helvetica').fillColor('#374151')
                    .text(`This certificate is issued at the request of the student to be used for all legal purposes.`, { align: 'justify' });

                // --- Signature Area ---
                doc.moveDown(4);
                const signatureY = doc.y;
                doc.text(`Date of Issue: ${currentDate}`, 50, signatureY);

                doc.font('Helvetica-Bold')
                    .text('The Registrar', 400, signatureY, { align: 'center' });

                // Add a digital signature "seal"
                doc.circle(450, signatureY + 50, 40)
                    .lineWidth(2)
                    .strokeColor('#111827')
                    .dash(5, { space: 5 })
                    .stroke();

                doc.fontSize(8).font('Helvetica-Bold')
                    .text('DIGITALLY SIGNED', 410, signatureY + 45, { width: 80, align: 'center' });

                // --- QR Code for Verification ---
                const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
                    color: {
                        dark: '#111827',
                        light: '#ffffff'
                    },
                    margin: 1
                });

                // Add the QR code to the bottom left
                doc.image(qrDataUrl, 50, 700, { width: 80 });

                doc.fontSize(8).font('Helvetica').fillColor('#9ca3af')
                    .text('SECURE VERIFICATION QR', 50, 785);

                doc.fontSize(7)
                    .text(`Verification ID: ${data.verification_id}`, 50, 795);

                // --- Footer ---
                doc.fontSize(8).fillColor('#9ca3af')
                    .text('UPF University - Smart Campus - Paperless Initiative', 0, 810, { align: 'center' });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = PDFGenerator;
