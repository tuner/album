#!/bin/sh

# Copyright (c) 2010 Kari Lavikka <tuner@bdb.fi>
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:

# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

echo "
<!DOCTYPE html
        PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"
        \"DTD/xhtml1-transitional.dtd\">

<html>
<head>
	<meta http-equiv=\"Content-Type\" content=\"text/html; charset=iso-8859-1\" />
	<link href=\"thumbs.css\" rel=\"stylesheet\" type=\"text/css\" />
	<title>$1</title>
        <script type=\"text/javascript\" src=\"http://ajax.googleapis.com/ajax/libs/prototype/1.6.0.2/prototype.js\"></script>
        <script type=\"text/javascript\" src=\"http://ajax.googleapis.com/ajax/libs/scriptaculous/1.8.1/scriptaculous.js\"></script>
        <script type=\"text/javascript\" src=\"/thumbs.js\"></script>
</head>
<body>
	<h1>$1</h1>
	<div id=\"thumbs\">
	<ul>" > index.html

if [ ! -d thumbs ]; then mkdir thumbs; fi

unalias ls

for A in `ls *.JPG *.jpg | sort`
do
	if [ ! -f thumbs/$A ]
	then
		echo "Scaling $A..."
		convert -strip -geometry 100x100 -quality 83 -unsharp 1x1+0.5 "$A" thumbs/"$A"
	else
		echo "$A was already scaled"
	fi

	SIZE=`identify thumbs/"$A" | sed 's/\(.*\) \([0-9]*\)x\([0-9]*\)\(.*\)/width=\"\2\" height=\"\3\"/g'`

	echo "		<li><a href=\"$A\"><img src=\"thumbs/$A\" alt=\"\" $SIZE /></a></li>" >> index.html
done

echo "	</ul>
	</div>
	<p id=\"copy\">&copy; Your Name</p>" >> index.html

echo "</body>
</html>" >> index.html
