install:
	mkdir -p /usr/lib/phantom-plot
	cp ./*.js ./phantom-plot phantomjs /usr/lib/phantom-plot
	ln -s /usr/lib/phantom-plot/phantom-plot /usr/bin/phantom-plot
