package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/matiasalvarado5/simplex-go/services"
)

func main() {
	router := gin.Default()

	//Middleware
	router.Use(corsMiddleware())

	//Templates
	router.LoadHTMLGlob("templates/*")

	// Rutas
	registerRoutes(router)

	// Servidor
	router.Run(":8080")
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func registerRoutes(r *gin.Engine) {
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "Metodo Simplex",
		})
	})
	r.POST("/solve", solveSimplexHandler)
}

func solveSimplexHandler(c *gin.Context) {
	var req services.SimplexRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := services.SolveSimplex(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}
