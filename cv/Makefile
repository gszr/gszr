IMAGE_NAME := cv-builder
DOCKER_RUN := docker run --rm -v $(CURDIR):/data -w /data $(IMAGE_NAME)

all: cv.pdf cv.txt cv.html cv.docx

image:
	docker build -t $(IMAGE_NAME) .

generated: cv.yaml schema.json theme.json src/render.mjs src/style.css image
	$(DOCKER_RUN) node src/render.mjs

cv.md cv.html cv.txt: generated

cv.pdf: cv.yaml theme.json templates/cv.typ image
	$(DOCKER_RUN) typst compile --root . templates/cv.typ $@

cv.docx: cv.md image
	$(DOCKER_RUN) pandoc --standalone --from markdown --to docx -o $@ $<

clean:
	rm -f cv.pdf cv.txt cv.html cv.docx cv.md

.PHONY: all image generated clean
