package services

import (
	"errors"
	"math"

	"gonum.org/v1/gonum/mat"
)

// Estructura para recibir los datos del problema
type SimplexRequest struct {
	A        [][]float64 `json:"A"`
	B        []float64   `json:"b"`
	Signs    []string    `json:"signs"` // "<=", ">=", "="
	C        []float64   `json:"c"`
	Maximize bool        `json:"maximize"`
}

// Estructura para devolver resultado
type SimplexResult struct {
	X      []float64
	Value  float64
	Status string
}

func SolveSimplex(req SimplexRequest) (*SimplexResult, error) {
	m, n := len(req.A), len(req.A[0])
	data := make([]float64, 0, m*n)
	for i := 0; i < m; i++ {
		data = append(data, req.A[i]...)
	}
	A := mat.NewDense(m, n, data)

	// Convertimos minimización a maximización
	cVec := make([]float64, n)
	if req.Maximize {
		copy(cVec, req.C)
	} else {
		for i := 0; i < n; i++ {
			cVec[i] = -req.C[i]
		}
	}

	// Contamos holgura y artificiales
	numSlack := 0
	numArtificial := 0
	for _, s := range req.Signs {
		if s == "<=" || s == ">=" {
			numSlack++
		}
		if s == ">=" || s == "=" {
			numArtificial++
		}
	}
	totalVars := n + numSlack + numArtificial

	// Tableau inicial
	tableau := mat.NewDense(m+1, totalVars+1, nil)

	basicVars := make([]int, m)

	artificialCols := make([]int, 0, numArtificial)

	slackIndex := n
	artificialIndex := n + numSlack

	for i := 0; i < m; i++ {
		for j := 0; j < n; j++ {
			tableau.Set(i, j, A.At(i, j))
		}
		switch req.Signs[i] {
		case "<=":
			tableau.Set(i, slackIndex, 1)
			basicVars[i] = slackIndex
			slackIndex++
		case ">=":
			tableau.Set(i, slackIndex, -1)
			tableau.Set(i, artificialIndex, 1)
			basicVars[i] = artificialIndex
			artificialCols = append(artificialCols, artificialIndex)
			slackIndex++
			artificialIndex++
		case "=":
			tableau.Set(i, artificialIndex, 1)
			basicVars[i] = artificialIndex
			artificialCols = append(artificialCols, artificialIndex)
			artificialIndex++
		default:
			return nil, errors.New("signo de restricción no soportado")
		}
		tableau.Set(i, totalVars, req.B[i])
	}

	// Lado derecho
	for i := 0; i < m; i++ {
		if tableau.At(i, totalVars) < 0 {
			for j := 0; j < totalVars+1; j++ {
				tableau.Set(i, j, -tableau.At(i, j))
			}
		}
	}

	// Problema auxiliar en caso de que hayan variables auxiliares
	if len(artificialCols) > 0 {
		if err := phaseOne(tableau, m, totalVars, basicVars, artificialCols); err != nil {
			return nil, err
		}
		tableau = removeCols(tableau, artificialCols)
		totalVars -= len(artificialCols)

		for i := 0; i < m; i++ {
			old := basicVars[i]
			basicVars[i] = mapOldToNewIndex(old, artificialCols)
		}

		// Evitamos casos degenerados
		for i := 0; i < m; i++ {
			if basicVars[i] == -1 {
				found := false
				for j := 0; j < totalVars; j++ {
					if math.Abs(tableau.At(i, j)) > 1e-9 {
						pivotWithBasis(tableau, i, j, basicVars)
						found = true
						break
					}
				}
				if !found {
				}
			}
		}
	}
	for j := 0; j < totalVars; j++ {
		if j < n {
			tableau.Set(m, j, -cVec[j])
		} else {
			tableau.Set(m, j, 0)
		}
	}
	tableau.Set(m, totalVars, 0)

	for i := 0; i < m; i++ {
		bcol := basicVars[i]
		if bcol >= 0 && bcol < n {
			coef := cVec[bcol]
			for j := 0; j <= totalVars; j++ {
				tableau.Set(m, j, tableau.At(m, j)+coef*tableau.At(i, j))
			}
		}
	}

	if err := simplexCore(tableau, m, totalVars, basicVars); err != nil {
		return nil, err
	}

	// Solucion
	solution := make([]float64, n)
	for j := 0; j < n; j++ {
		row := findBasicRow(tableau, j, m, totalVars)
		if row != -1 {
			solution[j] = tableau.At(row, totalVars)
		} else {
			solution[j] = 0
		}
	}

	opt := tableau.At(m, totalVars)
	if !req.Maximize {
		opt = -opt // Invertimos signo si era minimizacion
	}

	return &SimplexResult{
		X:      solution,
		Value:  opt,
		Status: "Optimo",
	}, nil
}

func phaseOne(tableau *mat.Dense, m, totalVars int, basicVars []int, artificialCols []int) error {
	phase := mat.DenseCopyOf(tableau)

	for _, a := range artificialCols {
		phase.Set(m, a, 1)
	}

	for i := 0; i < m; i++ {
		if containsInt(artificialCols, basicVars[i]) {
			for j := 0; j <= totalVars; j++ {
				phase.Set(m, j, phase.At(m, j)-phase.At(i, j))
			}
		}
	}

	if err := simplexCore(phase, m, totalVars, basicVars); err != nil {
		return err
	}

	if math.Abs(phase.At(m, totalVars)) > 1e-6 {
		return errors.New("problema infactible (fase1 no pudo anular artificiales)")
	}

	*tableau = *phase
	return nil
}

// Pivotes hasta la optimabilidad
func simplexCore(tableau *mat.Dense, m, totalVars int, basicVars []int) error {
	for {
		col := -1
		minValue := 0.0
		for j := 0; j < totalVars; j++ {
			if tableau.At(m, j) < minValue {
				minValue = tableau.At(m, j)
				col = j
			}
		}
		if col == -1 {
			break // solucion optima
		}

		row := -1
		ratioMin := math.Inf(1)
		for i := 0; i < m; i++ {
			if tableau.At(i, col) > 1e-9 {
				ratio := tableau.At(i, totalVars) / tableau.At(i, col)
				if ratio < ratioMin {
					ratioMin = ratio
					row = i
				}
			}
		}
		if row == -1 {
			return errors.New("problema no acotado")
		}
		pivotWithBasis(tableau, row, col, basicVars)
	}
	return nil
}

func pivotWithBasis(tableau *mat.Dense, row, col int, basicVars []int) {
	cols := tableau.RawMatrix().Cols
	// dividir fila pivote
	piv := tableau.At(row, col)
	for j := 0; j < cols; j++ {
		tableau.Set(row, j, tableau.At(row, j)/piv)
	}
	// eliminar en otras filas
	rows := tableau.RawMatrix().Rows
	for i := 0; i < rows; i++ {
		if i == row {
			continue
		}
		factor := tableau.At(i, col)
		if math.Abs(factor) < 1e-12 {
			continue
		}
		for j := 0; j < cols; j++ {
			tableau.Set(i, j, tableau.At(i, j)-factor*tableau.At(row, j))
		}
	}
	if row < len(basicVars) {
		basicVars[row] = col
	}
}

func removeCols(tableau *mat.Dense, colsToRemove []int) *mat.Dense {
	rows, cols := tableau.Dims()
	keep := make([]int, 0, cols)
	removeMap := make(map[int]bool)
	for _, c := range colsToRemove {
		removeMap[c] = true
	}
	for j := 0; j < cols; j++ {
		if !removeMap[j] {
			keep = append(keep, j)
		}
	}
	res := mat.NewDense(rows, len(keep), nil)
	for i := 0; i < rows; i++ {
		for k, j := range keep {
			res.Set(i, k, tableau.At(i, j))
		}
	}
	return res
}

func mapOldToNewIndex(old int, colsToRemove []int) int {
	if old < 0 {
		return -1
	}
	for _, c := range colsToRemove {
		if old == c {
			return -1
		}
	}
	removedBefore := 0
	for _, c := range colsToRemove {
		if c < old {
			removedBefore++
		}
	}
	return old - removedBefore
}

func findBasicRow(tableau *mat.Dense, col, m, totalVars int) int {
	rowIndex := -1
	cnt := 0
	for i := 0; i < m; i++ {
		v := tableau.At(i, col)
		if math.Abs(v-1.0) < 1e-9 {
			cnt++
			rowIndex = i
		} else if math.Abs(v) > 1e-9 {
			return -1
		}
	}
	if cnt == 1 {
		return rowIndex
	}
	return -1
}

func containsInt(a []int, v int) bool {
	for _, x := range a {
		if x == v {
			return true
		}
	}
	return false
}
