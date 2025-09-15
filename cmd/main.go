package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gonum.org/v1/gonum/mat"

	"github.com/matiasalvarado5/simplex-go/services"
)

func main() {
	router := gin.Default()
	router.LoadHTMLGlob("../templates/*")

	// Página principal
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "home.html", nil)
	})

	// Procesar formulario
	router.POST("/solve", func(c *gin.Context) {
		// Acá, por ahora, ponemos un problema de prueba fijo
		A := mat.NewDense(2, 2, []float64{
			2, 2,
			1, 2,
		})
		b := []float64{6, 6}
		cVec := []float64{3, 5}

		result, err := services.SolveSimplex(A, b, cVec, true)
		if err != nil {
			c.HTML(http.StatusOK, "home.html", gin.H{
				"error": err.Error(),
			})
			return
		}

		c.HTML(http.StatusOK, "home.html", gin.H{
			"resultado": result,
		})
	})

	router.Run(":8080")
}
