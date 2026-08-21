import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { Component, CircuitDoc } from "./types";
import { COMP_DEFS } from "./defs";

export async function exportToPdf(
  svgElement: SVGSVGElement,
  doc: CircuitDoc,
  graphElement?: HTMLElement | null
) {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 1. Page de garde / Schéma
  pdf.setFontSize(20);
  pdf.setTextColor(13, 18, 25);
  pdf.text("PneumaSim - Rapport de Conception", 15, 20);
  
  pdf.setFontSize(12);
  pdf.text(`Titre : ${doc.cartouche.titre}`, 15, 30);
  pdf.text(`Auteur : ${doc.cartouche.auteur}`, 15, 37);
  pdf.text(`Folio : ${doc.cartouche.folio}`, 15, 44);
  pdf.text(`Date : ${doc.cartouche.date}`, 15, 51);

  // Capture du SVG
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  
  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = url;
  });

  pdf.addImage(img, "PNG", 15, 60, pageWidth - 30, (pageWidth - 30) * (svgElement.clientHeight / svgElement.clientWidth));
  URL.revokeObjectURL(url);

  // 2. Nomenclature (BOM)
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.text("Nomenclature des composants (BOM)", 15, 20);

  const bom: Record<string, { count: number; label: string }> = {};
  doc.components.forEach((c) => {
    const def = COMP_DEFS[c.type];
    if (!def) return;
    if (!bom[c.type]) {
      bom[c.type] = { count: 0, label: def.label };
    }
    bom[c.type].count++;
  });

  let y = 40;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Quantité", 15, y);
  pdf.text("Désignation ISO 1219", 40, y);
  pdf.text("Type ID", 150, y);
  
  pdf.line(15, y + 2, pageWidth - 15, y + 2);
  y += 10;
  
  pdf.setFont("helvetica", "normal");
  Object.entries(bom).forEach(([type, data]) => {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(data.count.toString(), 15, y);
    pdf.text(data.label, 40, y);
    pdf.text(type, 150, y);
    y += 8;
  });

  // 3. Graphiques de performance (si présents)
  if (graphElement) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.text("Analyses de Performance", 15, 20);
    
    const graphCanvas = await html2canvas(graphElement, {
      backgroundColor: "#0d1219",
      scale: 2,
    });
    
    const graphImg = graphCanvas.toDataURL("image/png");
    const graphW = pageWidth - 30;
    const graphH = (graphW * graphCanvas.height) / graphCanvas.width;
    
    pdf.addImage(graphImg, "PNG", 15, 30, graphW, graphH);
  }

  // Pied de page sur toutes les pages
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`Généré par PneumaSim - ${new Date().toLocaleString()} - Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  pdf.save(`PneumaSim_${doc.cartouche.titre.replace(/\s+/g, "_")}.pdf`);
}
