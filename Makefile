install:
	mkdir -p /usr/lib/phantom-plot
	cp ./*.js ./phantom-plot phantomjs /usr/lib/phantom-plot
	rm -f /usr/bin/phantom-plot
	ln -s /usr/lib/phantom-plot/phantom-plot /usr/bin/phantom-plot

develop:
	rm -rf /usr/lib/phantom-plot
	ln -s `readlink -f .` /usr/lib/phantom-plot/ 
	rm -f /usr/bin/phantom-plot
	ln -s /usr/lib/phantom-plot/phantom-plot /usr/bin/phantom-plot
