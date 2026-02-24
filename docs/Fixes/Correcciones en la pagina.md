
# Problema de espacio en el Simulador

Tengo un problema, en el "Simulador" el primer valor:

Tamaño total antes de la reducción, en MB:

está en una sola línea, pero el segundo valor está así:

Espacio disponible para la reducción, 
en MB:

esto es porque está así:

```css
.winRow{
  display:grid;
  grid-template-columns: 1fr 230px;
  gap:10px;
  align-items:center;
}
```


![](images/01-Descripcion-de-los-componentes-label-e-input-en-el-simulador.png)


