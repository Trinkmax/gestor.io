// ================================
// IMPORT WIZARD
// Wizard para importar productos desde CSV
// ================================

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Modal, Input } from '../../../components/ui';
import { useUI } from '../../../contexts/UIContext';
import type { Category } from '../../../types';

interface ImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onImport: (data: ImportRow[], createMissingCategories: boolean) => void;
}

interface ImportRow {
    name: string;
    code?: string;
    price: number;
    cost?: number;
    stock: number;
    minStock?: number;
    category?: string;
    isActive: boolean;
}

interface ParsedData {
    headers: string[];
    rows: string[][];
}

const EXPECTED_COLUMNS = [
    'nombre',
    'codigo',
    'precio',
    'costo',
    'stock',
    'minimo',
    'categoria',
    'activo',
];

export function ImportWizard({ isOpen, onClose, categories, onImport }: ImportWizardProps) {
    const { showToast } = useUI();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [columnMapping, setColumnMapping] = useState<Record<string, number>>({});
    const [previewData, setPreviewData] = useState<ImportRow[]>([]);
    const [createMissingCategories, setCreateMissingCategories] = useState(true);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            showToast('warning', 'El archivo debe ser CSV');
            return;
        }

        setFile(selectedFile);

        // Parse CSV
        const reader = new FileReader();
        reader.onload = event => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                showToast('error', 'El archivo está vacío');
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

            setParsedData({ headers, rows });

            // Auto-detect column mapping
            const mapping: Record<string, number> = {};
            EXPECTED_COLUMNS.forEach(col => {
                const index = headers.findIndex(h => h.includes(col));
                if (index !== -1) mapping[col] = index;
            });
            setColumnMapping(mapping);

            setStep(2);
        };
        reader.readAsText(selectedFile);
    };

    const handlePreview = () => {
        if (!parsedData) return;

        const errors: string[] = [];
        const data: ImportRow[] = [];

        parsedData.rows.forEach((row, index) => {
            const name = row[columnMapping['nombre']]?.trim();
            const priceStr = row[columnMapping['precio']]?.trim();

            if (!name) {
                errors.push(`Fila ${index + 2}: Falta nombre`);
                return;
            }

            if (!priceStr || isNaN(parseFloat(priceStr))) {
                errors.push(`Fila ${index + 2}: Precio inválido`);
                return;
            }

            const importRow: ImportRow = {
                name,
                code: row[columnMapping['codigo']]?.trim() || undefined,
                price: parseFloat(priceStr),
                cost: columnMapping['costo'] !== undefined
                    ? parseFloat(row[columnMapping['costo']]) || undefined
                    : undefined,
                stock: parseInt(row[columnMapping['stock']]) || 0,
                minStock: columnMapping['minimo'] !== undefined
                    ? parseInt(row[columnMapping['minimo']]) || undefined
                    : undefined,
                category: row[columnMapping['categoria']]?.trim() || undefined,
                isActive: columnMapping['activo'] !== undefined
                    ? row[columnMapping['activo']]?.toLowerCase() === 'si' ||
                      row[columnMapping['activo']]?.toLowerCase() === 'true'
                    : true,
            };

            data.push(importRow);
        });

        setValidationErrors(errors);
        setPreviewData(data);
        setStep(3);
    };

    const handleImport = () => {
        if (validationErrors.length > 0) {
            showToast('warning', 'Hay errores que deben corregirse');
            return;
        }

        onImport(previewData, createMissingCategories);
        handleClose();
        showToast('success', `${previewData.length} productos importados`);
    };

    const handleClose = () => {
        setStep(1);
        setFile(null);
        setParsedData(null);
        setColumnMapping({});
        setPreviewData([]);
        setValidationErrors([]);
        onClose();
    };

    const missingCategories = previewData
        .map(p => p.category)
        .filter(c => c && !categories.some(cat => cat.name.toLowerCase() === c.toLowerCase()))
        .filter((v, i, a) => a.indexOf(v) === i);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Importar productos" size="lg">
            <div className="import-wizard">
                {/* Step 1: Upload */}
                {step === 1 && (
                    <div className="import-wizard-step">
                        <div className="import-wizard-upload">
                            <Upload size={48} className="import-wizard-upload-icon" />
                            <h3>Seleccionar archivo CSV</h3>
                            <p className="text-secondary">
                                El archivo debe contener columnas: Nombre, Código, Precio, Costo, Stock, Mínimo, Categoría, Activo
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <Button
                                variant="primary"
                                leftIcon={<FileText size={16} />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Seleccionar archivo
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Column Mapping */}
                {step === 2 && parsedData && (
                    <div className="import-wizard-step">
                        <h3>Mapear columnas</h3>
                        <p className="text-secondary">
                            Verificá que las columnas estén correctamente mapeadas
                        </p>
                        <div className="import-wizard-mapping">
                            {EXPECTED_COLUMNS.map(col => (
                                <div key={col} className="import-wizard-mapping-row">
                                    <label>{col.charAt(0).toUpperCase() + col.slice(1)}</label>
                                    <select
                                        value={columnMapping[col] ?? -1}
                                        onChange={e =>
                                            setColumnMapping({
                                                ...columnMapping,
                                                [col]: parseInt(e.target.value),
                                            })
                                        }
                                        className="import-wizard-select"
                                    >
                                        <option value={-1}>- No incluir -</option>
                                        {parsedData.headers.map((header, index) => (
                                            <option key={index} value={index}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="import-wizard-actions">
                            <Button variant="secondary" onClick={() => setStep(1)}>
                                Atrás
                            </Button>
                            <Button variant="primary" onClick={handlePreview}>
                                Vista previa
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && (
                    <div className="import-wizard-step">
                        <h3>Vista previa</h3>
                        
                        {validationErrors.length > 0 && (
                            <div className="import-wizard-errors">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>{validationErrors.length} error(es) encontrado(s)</strong>
                                    <ul>
                                        {validationErrors.slice(0, 5).map((error, i) => (
                                            <li key={i}>{error}</li>
                                        ))}
                                    </ul>
                                    {validationErrors.length > 5 && (
                                        <p>... y {validationErrors.length - 5} más</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {missingCategories.length > 0 && (
                            <div className="import-wizard-warning">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>Categorías no encontradas:</strong>
                                    <p>{missingCategories.join(', ')}</p>
                                    <label className="import-wizard-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={createMissingCategories}
                                            onChange={e => setCreateMissingCategories(e.target.checked)}
                                        />
                                        Crear categorías faltantes automáticamente
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="import-wizard-preview">
                            <p className="text-secondary">
                                Se importarán {previewData.length} producto(s)
                            </p>
                            <div className="import-wizard-preview-table">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Código</th>
                                            <th>Precio</th>
                                            <th>Stock</th>
                                            <th>Categoría</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 10).map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.name}</td>
                                                <td>{row.code || '-'}</td>
                                                <td>${row.price}</td>
                                                <td>{row.stock}</td>
                                                <td>{row.category || 'Sin categoría'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.length > 10 && (
                                    <p className="text-tertiary text-sm">
                                        ... y {previewData.length - 10} más
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="import-wizard-actions">
                            <Button variant="secondary" onClick={() => setStep(2)}>
                                Atrás
                            </Button>
                            <Button
                                variant="primary"
                                leftIcon={<CheckCircle size={16} />}
                                onClick={handleImport}
                                disabled={validationErrors.length > 0}
                            >
                                Importar productos
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
