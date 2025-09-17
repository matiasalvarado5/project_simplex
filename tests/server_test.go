package tests

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestServerStartup(t *testing.T) {
	// Configuramos un router mínimo como en main.go
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	// Creamos una petición de prueba
	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	// Servimos la petición
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Servidor no respondió correctamente, código esperado 200, got %d", w.Code)
	}
}
