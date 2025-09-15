package services

import (
	"errors"
	"math"

	"gonum.org/v1/gonum/mat"
)

// Resultado devuelto por el metodo simplex
type SimplexResult struct {
	X      []float64
	Value  float64
	Status string
}

func SolveSimplex(A *mat.Dense, b, c []float64, maximize bool) (*SimplexResult, error) {
	if !maximize {
		return nil, errors.New("solo esta implementado maximizacion")
	}
	m, n := A.Dims()

	// Tableau inicial
	tableau := mat.NewDense(m+1, n+m+1, nil)

	// Reestricciones
	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			tableau.Set(i, j, A.At(i, j))
		}
		tableau.Set(i, n+i, 1)    // Variables de holgura
		tableau.Set(i, n+m, b[i]) // Lado derecho
	}

	// Objetivo
	for j := 0; j < n; j++ {
		tableau.Set(m, j, -c[j])
	}

	// Algoritmo del metodo simplex
	for {
		// Columna pivote
		col := -1
		minValue := 0.0
		for j := 0; j < n+m; j++ {
			if tableau.At(m, j) < minValue {
				minValue = tableau.At(m, j)
				col = j
			}
		}
		if col == -1 {
			break // Solucion optima
		}
		// Fila pivote
		row := -1
		ratioMin := math.Inf(1)
		for i := 0; i < m; i++ {
			if tableau.At(i, col) > 1e-9 {
				ratio := tableau.At(i, n+m) / tableau.At(i, col)
				if ratio < ratioMin {
					ratioMin = ratio
					row = i
				}
			}
		}
		if row == -1 {
			return nil, errors.New("el problema no esta acotado")
		}
		// Pivotear
		pivot := tableau.At(row, col)
		for j := 0; j < n+m+1; j++ {
			tableau.Set(row, j, tableau.At(row, j)/pivot)
		}
		for i := 0; i < m+1; i++ {
			if i == row {
				continue
			}
			factor := tableau.At(i, col)
			for j := 0; j < n+m+1; j++ {
				tableau.Set(i, j, tableau.At(i, j)-factor*tableau.At(row, j))
			}
		}
	}
	// Solucion
	solution := make([]float64, n)
	for j := 0; j < n; j++ {
		rowIndex := -1
		for i := 0; i < m; i++ {
			if almostEqual(tableau.At(i, j), 1.0) {
				if rowIndex == -1 {
					rowIndex = i
				} else {
					rowIndex = -1
					break
				}
			} else if !almostEqual(tableau.At(i, j), 0.0) {
				rowIndex = -1
				break
			}
		}
		if rowIndex != -1 {
			solution[j] = tableau.At(rowIndex, n+m)
		}
	}
	optimal := tableau.At(m, n+m)
	return &SimplexResult{
		X:      solution,
		Value:  optimal,
		Status: "Optimo",
	}, nil
}

// almostEqual para floats
func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < 1e-6
}
