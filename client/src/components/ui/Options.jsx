// <option> a partir de un objeto { valor: etiqueta }
export default function Options({ map, placeholder }) {
  return (
    <>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {Object.entries(map).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </>
  )
}
