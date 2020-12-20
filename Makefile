.PHONY: all tsc dist serve bundle

all: tsc dist

tsc:
	rm -rf js
	tsc

dist:
	rm -rf output
	mkdir output
	mkdir output/3rd-party
	cp static/3rd-party/vue-v3.0.4.js output/3rd-party/
	cp static/3rd-party/vuex-v4.0.0-rc2.js output/3rd-party/
	cp static/favicon.ico output/
	cp static/index.html output/
	cp static/mute_icon.png output/
	cp static/speaker_icon.png output/
	cp static/launcher_icon.png output/
	cp static/styles.css output/
	cp static/manifest.json output/
	cp js/utils.js output/
	cp js/utils.js.map output/
	cp js/snapcontrol.js output/
	cp js/snapcontrol.js.map output/
	cp js/frontend.js output/
	cp js/frontend.js.map output/
	cp config.json output/

serve:
	python3 -m http.server --directory output

bundle:
	rm -f snapidy.zip
	cd output && \
		zip ../snapidy.zip * -x "config.json" && \
		zip -r ../snapidy.zip 3rd-party
