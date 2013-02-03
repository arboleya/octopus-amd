.PHONY: build

CS=node_modules/.bin/coffee
UJS=node_modules/.bin/uglifyjs
VERSION=`$(CS) build/bumper --version`

build:
	@$(CS) -o lib -j octupus.coffee -cb \
		src/.header.coffee \
		src/script.coffee \
		src/chunk.coffee \
		src/octupus.coffee

	@sed -i.bak 's/\/\/.*//g' lib/octupus.js
	@rm lib/octupus.js.bak
	@$(UJS) -o lib/octupus.min.js lib/octupus.js
	@echo 'Build sucessfull.'

watch:
	@echo 'Watching...'
	@$(CS) -o lib -j octupus.coffee -cbw \
		src/script.coffee \
		src/chunk.coffee \
		src/octupus.coffee


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