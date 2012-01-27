# This file is part of GNU WebSocket4J.
# Copyright (C) 2010  Marek Aaron Sapota
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#
# As a special exception, the copyright holders of this library give you
# permission to link this library with independent modules to produce an
# executable, regardless of the license terms of these independent modules,
# and to copy and distribute the resulting executable under terms of your choice,
# provided that you also meet, for each linked independent module, the terms and
# conditions of the license of that module. An independent module is a module
# which is not derived from or based on this library. If you modify this library,
# you may extend this exception to your version of the library, but you are not
# obligated to do so. If you do not wish to do so, delete this exception
# statement from your version.

EXTRA_DIST = src
SUBDIRS = doc

VERSION = @PACKAGE_VERSION@
BUILD_TYPE = @BUILD_TYPE@

PACKAGEDIR = ${abs_builddir}/package
DISTDIR = ${abs_builddir}/dist
DOCDIR = ${abs_builddir}/javadoc
RPMHOMEDIR = ${abs_builddir}/rpm-home
RPMDIR = ${abs_srcdir}/rpm
RPMTOPDIR = ${RPMHOMEDIR}/rpmbuild
PKGDATADIR = ${DESTDIR}${pkgdatadir}
DOCDATADIR = ${DESTDIR}${docdir}/api

all-local: build-${BUILD_TYPE}
clean-local: clean-${BUILD_TYPE}
install-data-local: install-${BUILD_TYPE}
installdirs-local: installdirs-${BUILD_TYPE}
uninstall-local: uninstall-${BUILD_TYPE}

dist-hook:
	ant doc
	cp -r ${DOCDIR} ${distdir}

${PACKAGE}-${VERSION}.tar.gz:
	make dist

build-ant:
	ant all

prepare-package:
	mkdir -p ${PACKAGEDIR}

build-gnu: build-ant

build-deb: prepare-package build-ant deb_package

deb_package:
	dh_testdir
	dh_prep
	jh_installlibs ${DISTDIR}/${PACKAGE}.jar
	jh_installjavadoc ${DOCDIR}
	jh_depends
	dh_compress
	fakeroot dh_fixperms
	fakeroot dh_installdeb
	fakeroot dh_gencontrol
	fakeroot dh_md5sums
	dh_builddeb --destdir=${PACKAGEDIR}
	touch deb_package

build-rpm: prepare-package rpm_package

rpm_package: ${PACKAGE}-${VERSION}.tar.gz
	${mkdir_p} ${RPMTOPDIR}
	cd ${RPMTOPDIR} && \
		${mkdir_p} BUILD BUILDROOT RPMS SOURCES SPECS SRPMS
	echo "%_topdir ${RPMTOPDIR}" > ${RPMHOMEDIR}/.rpmmacros
	cp ${RPMDIR}/websocket4j.spec ${RPMTOPDIR}/SPECS/${PACKAGE}.spec
	cp ${PACKAGE}-${VERSION}.tar.gz ${RPMTOPDIR}/SOURCES
	env HOME=${RPMHOMEDIR} \
		rpmbuild -bb ${RPMTOPDIR}/SPECS/${PACKAGE}.spec
	cp ${RPMTOPDIR}/RPMS/*/${PACKAGE}-${VERSION}*.rpm ${PACKAGEDIR}
	cp ${RPMTOPDIR}/RPMS/*/${PACKAGE}-javadoc-${VERSION}*.rpm ${PACKAGEDIR}
	touch rpm_package

installdirs-gnu:
	${mkdir_p} ${PKGDATADIR}
	${mkdir_p} ${DOCDATADIR}

installdirs-deb:

installdirs-rpm:

install-gnu: build-gnu installdirs-gnu
	${INSTALL_DATA} ${DISTDIR}/${PACKAGE}.jar ${PKGDATADIR}/${PACKAGE}-${VERSION}.jar
	cp -r ${DOCDIR}/* ${DOCDATADIR}
	cd ${PKGDATADIR} && ${LN_S} ${PACKAGE}-${VERSION}.jar ${PACKAGE}.jar

install-deb:
	dpkg -i ${PACKAGEDIR}/${PACKAGE}_${VERSION}*.deb

install-rpm:
	rpm -i ${PACKAGEDIR}/${PACKAGE}-${VERSION}*.rpm
	rpm -i ${PACKAGEDIR}/${PACKAGE}-javadoc-${VERSION}*.rpm

uninstall-gnu:
	rm -f ${PKGDATADIR}/${PACKAGE}-${VERSION}.jar
	rm -f ${PKGDATADIR}/${PACKAGE}.jar
	rm -rf ${DOCDATADIR}

uninstall-deb:
	dpkg -P ${PACKAGE}

uninstall-rpm:
	rpm -e ${PACKAGE} ${PACKAGE}-javadoc

clean-common:
	ant clean
	rm -f ${PACKAGE}-${VERSION}.tar.gz

clean-package:
	rm -rf ${PACKAGEDIR}

clean-gnu: clean-common

clean-deb: clean-common clean-package
	dh_testdir
	fakeroot dh_clean
	fakeroot jh_clean
	rm -f deb_package

clean-rpm: clean-common clean-package
	rm -rf ${RPMHOMEDIR}
	rm -f rpm_package
