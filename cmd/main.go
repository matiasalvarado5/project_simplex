package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gonum.org/v1/gonum/mat"

	"github.com/matiasalvarado5/simplex-go/services"
)

// Estructura para recibir los datos del problema
type SimplexRequest struct {
	A        [][]float64 `json:"A"`        // Matriz de restricciones
	B        []float64   `json:"b"`        // Lado derecho
	C        []float64   `json:"c"`        // Coeficientes de la función objetivo
	Maximize bool        `json:"maximize"` // true = maximización
}

func main() {
	router := gin.Default()

	// 🔓 Middleware para habilitar CORS
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Ruta de prueba
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "hola esta es la aplicacion web del metodo simplex",
		})
	})

	// Nueva ruta para resolver simplex
	router.POST("/solve", func(c *gin.Context) {
		var req SimplexRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Convertir [][]float64 en *mat.Dense
		m, n := len(req.A), len(req.A[0])
		data := make([]float64, 0, m*n)
		for i := 0; i < m; i++ {
			data = append(data, req.A[i]...)
		}
		A := mat.NewDense(m, n, data)

		// Resolver
		result, err := services.SolveSimplex(A, req.B, req.C, req.Maximize)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Levantar servidor en puerto 8080
	router.Run(":8080")
}
