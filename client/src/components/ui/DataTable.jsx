import { cx } from './cx'
import Card from './Card'
import { TBody, Table, THead, Td, Th, Tr } from './Table'

/*
  columns: [{ key, header, cell(row), className?, cellClassName?, align? }]
  renderCard(row): contenido de cada elemento en la vista móvil
*/
export default function DataTable({ rows, rowKey, columns, renderCard }) {
  const alignClass = (c) => (c.align === 'right' ? 'text-right' : '')

  return (
    <>
      <Card flush className="md:hidden">
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={rowKey(row)} className="p-4">
              {renderCard(row)}
            </li>
          ))}
        </ul>
      </Card>

      <Card flush className="hidden md:block">
        <Table>
          <THead>
            {columns.map((c) => (
              <Th key={c.key} className={cx(c.className, alignClass(c))}>
                {c.header}
              </Th>
            ))}
          </THead>
          <TBody>
            {rows.map((row) => (
              <Tr key={rowKey(row)}>
                {columns.map((c) => (
                  <Td key={c.key} className={cx(c.className, c.cellClassName, alignClass(c))}>
                    {c.cell(row)}
                  </Td>
                ))}
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  )
}
