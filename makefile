.PHONY: build

CS=node_modules/.bin/coffee
UJS=node_modules/.bin/uglifyjs
VERSION=`$(CS) build/bumper --version`

build:
	@$(CS) -o lib -j octopus-amd.coffee -cb \
		src/.header.coffee \
		src/script.coffee \
		src/chunk.coffee \
		src/octopus.coffee

	@sed -i.bak 's/\/\/.*//g' lib/octopus-amd.js
	@rm lib/octopus-amd.js.bak
	@$(UJS) -o lib/octopus-amd.min.js lib/octopus-amd.js
	@echo 'Build sucessfull.'

watch:
	@echo 'Watching...'
	@$(CS) -o lib -j octopus-amd.coffee -cbw \
		src/script.coffee \
		src/chunk.coffee \
		src/octopus.coffee


setup:
	sudo npm link

test: build
	# todo



bump.minor:
	$(CS) build/bumper.coffee --minor

bump.major:
	$(CS) build/bumper.coffee --major

bump.patch:
	$(CS) build/bumper.coffee --patch


publish:
	git tag $(VERSION)
	git push origin $(VERSION)
	git push origin master
	npm publish

re-publish:
	git tag -d $(VERSION)
	git tag $(VERSION)
	git push origin :$(VERSION)
	git push origin $(VERSION)
	git push origin master -f
	npm publish -f