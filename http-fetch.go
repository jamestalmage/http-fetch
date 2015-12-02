package main

import (
	"io"
	"net/http"
	"os"
)

func main() {
	resp, err := http.Get(os.Args[1])

	if err != nil {
		// handle error
		os.Exit(1)
	}

	if (resp.StatusCode != 200) {
		io.Copy(os.Stderr, resp.Body)
		// exit with whatever the StatusCode was
		os.Exit(resp.StatusCode)
	} else {
		io.Copy(os.Stdout, resp.Body)
	}
}
