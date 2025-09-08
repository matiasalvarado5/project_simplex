package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	//ruta de prueba mediante un json
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "hola esta es la aplicacion web del metodo simplex",
		})
	})
	router.Run(":8080")
}
