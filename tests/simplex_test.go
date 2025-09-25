package tests

import (
	"math"
	"testing"

	"github.com/matiasalvarado5/simplex-go/services"
)

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < 1e-6
}

func TestSolveSimplexMaximization(t *testing.T) {
	// Maximizar:
	// 		Z=3x1+2x2
	// Reestricciones:
	// 		x1+x2<=4
	// 		x1<=2
	// 		x2<=4
	// Resultado esperado
	// 		x1=2;x2=2;z=10

	// Matriz reestricciones
	A := [][]float64{
		{1, 1},
		{1, 0},
		{0, 1},
	}

	//Lado derecho
	b := []float64{4, 2, 4}

	// Funcion objetivo
	c := []float64{3, 2}

	// Signos
	signs := []string{"<=", "<=", "<="}

	// Armo request
	req := services.SimplexRequest{
		A:        A,
		B:        b,
		Signs:    signs,
		C:        c,
		Maximize: true,
	}

	// Uso metodo simplex
	result, error := services.SolveSimplex(req)

	// Verifico que no exista error
	if error != nil {
		t.Fatalf("Error al resolver metodo simplex: %v", error)
	}
	// Verifico que sea solucion optima
	if result.Status != "Optimo" {
		t.Fatalf("Se esperaba solucion optimo, se obtuvo status %v", result.Status)
	}
	// Resultado esperado
	expectedX := []float64{2, 2}
	// Compruebo solucion optima y valor de maximizacion obtenidos con el metodo simplex
	for i := range expectedX {
		if !almostEqual(result.X[i], expectedX[i]) {
			t.Errorf("x%d esperado: %.2f, obtenido: %.6f", i+1, expectedX[i], result.X[i])
		}
	}
	if !almostEqual(result.Value, 10) {
		t.Errorf("valor optimo esperado 10, obtenido %.6f", result.Value)
	}
}

func TestSolveSimplexMinimization(t *testing.T) {
	// Minimizar:
	//     Z = x1 + x2
	// Restricciones:
	//     2x1 + x2 >= 4
	//     x1 + 2x2 >= 5
	// Resultado esperado
	//     x1=1; x2=2; Z=3

	// Matriz reestricciones
	A := [][]float64{
		{2, 1},
		{1, 2},
	}
	// Lado derecho
	b := []float64{4, 5}

	// Funcion objetivo
	c := []float64{1, 1}

	// Signos
	signs := []string{">=", ">="}

	// Armo request
	req := services.SimplexRequest{
		A:        A,
		B:        b,
		Signs:    signs,
		C:        c,
		Maximize: false,
	}

	// Uso metodo simplex
	result, err := services.SolveSimplex(req)

	// Verifico que no exista error
	if err != nil {
		t.Fatalf("Error en simplex minimización: %v", err)
	}
	// Verifico que sea solucion optima
	if result.Status != "Optimo" {
		t.Fatalf("Se esperaba solución óptima, se obtuvo %v", result.Status)
	}
	// Resultado esperado
	expectedX := []float64{1, 2}
	for i := range expectedX {
		if !almostEqual(result.X[i], expectedX[i]) {
			t.Errorf("x%d esperado: %.2f, obtenido: %.6f", i+1, expectedX[i], result.X[i])
		}
	}
	if !almostEqual(result.Value, 3) {
		t.Errorf("valor optimo esperado 3, obtenido %.6f", result.Value)
	}
}
