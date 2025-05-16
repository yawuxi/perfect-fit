extension_path := $(HOME)/.local/share/gnome-shell/extensions/perfect-fit@ryliov.work.com

.PHONY: clean build install-local node_modules

node_modules:
	@npm install

clean:
	@rm -rf ./dist

build: clean node_modules src/schemas/org.gnome.shell.extensions.perfect-fit.gschema.xml
	@mkdir -p dist && \
	mkdir -p dist/schemas && \
	glib-compile-schemas src/schemas --targetdir=dist/schemas && \
	cp src/metadata.json dist/metadata.json && \
	cp src/schemas/*  dist/schemas && \
	tsc && \
	cd ./dist && \
	zip -r -3 perfect-fit ./ && \
	echo 'BUILD SUCCESS'

install-local: clean build
	@echo "REMOVING EXTENSION DIR $(extension_path)" && \
	rm -rf "$(extension_path)" && \
	echo "CREATING NEW EXTENSION DIR" && \
	mkdir -p "$(extension_path)" && \
	echo "COPYING EXTENSION" && \
	cp -r dist/* "$(extension_path)"
