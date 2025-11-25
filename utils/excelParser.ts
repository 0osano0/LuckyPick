import * as XLSX from 'xlsx';

export const parseExcelFile = async (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("文件为空"));
          return;
        }

        // Use array buffer for better compatibility
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Read the first sheet
        const sheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        // Flatten the array and filter for valid strings
        const names: string[] = [];
        jsonData.forEach(row => {
          row.forEach(cell => {
            // Check for strings
            if (cell && typeof cell === 'string' && cell.trim().length > 0) {
              names.push(cell.trim());
            } 
            // Check for numbers (often IDs or numeric names)
            else if (cell !== null && cell !== undefined && typeof cell === 'number') {
              names.push(String(cell));
            }
          });
        });

        if (names.length === 0) {
          reject(new Error("Excel 文件中未找到有效的姓名。"));
        } else {
          resolve(names);
        }

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};