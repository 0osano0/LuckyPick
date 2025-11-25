import React, { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { parseExcelFile } from '../utils/excelParser';

interface FileUploadProps {
  onFileLoaded: (names: string[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError("请上传有效的 Excel 文件 (.xlsx, .xls)。");
      return;
    }

    setIsLoading(true);
    try {
      const names = await parseExcelFile(file);
      onFileLoaded(names);
    } catch (err) {
      setError("解析文件失败。请确保文件包含文本数据。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
          ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'}
        `}
      >
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isLoading ? 'bg-indigo-100 animate-pulse' : 'bg-indigo-50'}`}>
            {isLoading ? (
              <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
            ) : (
              <Upload className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {isLoading ? '处理中...' : '上传 Excel 表格'}
            </h3>
            <p className="text-slate-500 mt-1 text-sm">
              拖放或点击选择文件 (xlsx, xls)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">使用说明</p>
        <p className="text-xs text-slate-500 mt-1">
          上传一个简单的 Excel 表格。应用将自动提取第一个工作表中的所有姓名。
        </p>
      </div>
    </div>
  );
};