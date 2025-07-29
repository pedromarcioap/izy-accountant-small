import React, 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

interface Row {
  id: number;
  local: string;
  estabelecimento: string;
  valor: string;
  data: string;
  categoria: string;
}

interface DataTableProps {
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
}

const columns = [
  { key: 'local', name: 'Local' },
  { key: 'estabelecimento', name: 'Estabelecimento' },
  { key: 'valor', name: 'Valor' },
  { key: 'data', name: 'Data' },
  { key: 'categoria', name: 'Categoria' },
];

const DataTable: React.FC<DataTableProps> = ({ rows, onRowsChange }) => {
  return (
    <DataGrid
      columns={columns}
      rows={rows}
      onRowsChange={onRowsChange}
    />
  );
};

export default DataTable;
