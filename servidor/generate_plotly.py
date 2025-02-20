import sys
import json
import plotly.graph_objects as go

# Leer argumentos
json_file = sys.argv[1]
html_file = sys.argv[2]

# Cargar datos desde JSON
with open(json_file, 'r') as f:
    data = json.load(f)

# Extraer datos correctamente
x_values = [frame["x"] for frame in data]  # Extrae listas de X
y_values = [frame["y"] for frame in data]  # Extrae listas de Y

# Asegurar que y_values es una lista de números (aplanada)
flattened_y_values = [val for sublist in y_values for val in sublist]

# Crear animación con Plotly
fig = go.Figure(
    data=[go.Bar(x=x_values[0], y=y_values[0], marker=dict(color=data[0]["colors"]))],
    layout=go.Layout(
        title="Animación con Plotly",
        xaxis=dict(range=[0, max(x_values[0])]),
        yaxis=dict(range=[min(flattened_y_values), max(flattened_y_values)])
    )
)

# Agregar los frames a la animación
frames = [go.Frame(data=[go.Bar(x=frame["x"], y=frame["y"], marker=dict(color=frame["colors"]))])
          for frame in data]

fig.update(frames=frames)

# Configuración de botones de animación
fig.update_layout(
    updatemenus=[{
        "buttons": [
            {"args": [None, {"frame": {"duration": 500, "redraw": True}, "fromcurrent": True}], "label": "Play", "method": "animate"},
            {"args": [[None], {"frame": {"duration": 0, "redraw": True}, "mode": "immediate", "transition": {"duration": 0}}], "label": "Pause", "method": "animate"}
        ],
        "direction": "left",
        "pad": {"r": 10, "t": 10},
        "showactive": False,
        "type": "buttons",
        "x": 0.1,
        "xanchor": "right",
        "y": 0,
        "yanchor": "top"
    }]
)

# Guardar la animación como HTML
fig.write_html(html_file)
