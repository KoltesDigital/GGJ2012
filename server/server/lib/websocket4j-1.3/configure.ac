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

AC_INIT([GNU WebSocket4J], [1.3], [], [], [http://students.mimuw.edu.pl/~ms262969/maarons/wsgi.py/software/WebSocket4J/])
AM_INIT_AUTOMAKE

AC_CONFIG_FILES([Makefile doc/Makefile])
AC_CONFIG_FILES([build.xml])
AC_CONFIG_FILES([doc/dirs.texi])
AC_CONFIG_FILES([rpm/websocket4j.spec])
AC_CONFIG_FILES([debian/compat debian/control debian/changelog])
AC_CONFIG_FILES([README])

# Check if software required for compilation is present
AC_CHECK_PROG(HAVE_JAVAC, javac, yes)
AC_CHECK_PROG(HAVE_JAVA, java, yes)
AC_CHECK_PROG(HAVE_JAVADOC, javadoc, yes)
AC_CHECK_PROG(HAVE_ANT, ant, yes)
if test "${HAVE_JAVAC}" != "yes" -o "${HAVE_JAVA}" != "yes" \
    -o "${HAVE_JAVADOC}" != "yes" -o "${HAVE_ANT}" != "yes"
then
    AC_MSG_ERROR(["Software required for compilation is not present"])
fi
AC_PROG_LN_S

# Check for possible build types

# RPM based distro
AC_CHECK_PROG(HAVE_RPMBUILD, rpmbuild, yes)
AC_CHECK_PROG(HAVE_RPM, rpm, yes)
# DEB based distro
AC_CHECK_PROG(HAVE_DH_TESTDIR, dh_testdir, yes)
AC_CHECK_PROG(HAVE_DH_PREP, dh_prep, yes)
AC_CHECK_PROG(HAVE_JH_INSTALLLIBS, jh_installlibs, yes)
AC_CHECK_PROG(HAVE_JH_INSTALLJAVADOC, jh_installjavadoc, yes)
AC_CHECK_PROG(HAVE_JH_DEPENDS, jh_depends, yes)
AC_CHECK_PROG(HAVE_DH_COMPRESS, dh_compress, yes)
AC_CHECK_PROG(HAVE_DH_FIXPERMS, dh_fixperms, yes)
AC_CHECK_PROG(HAVE_DH_INSTALLDEB, dh_installdeb, yes)
AC_CHECK_PROG(HAVE_DH_GENCONTROL, dh_gencontrol, yes)
AC_CHECK_PROG(HAVE_DH_MD5SUMS, dh_md5sums, yes)
AC_CHECK_PROG(HAVE_DH_BUILDDEB, dh_builddeb, yes)
AC_CHECK_PROG(HAVE_DH_CLEAN, dh_clean, yes)
AC_CHECK_PROG(HAVE_JH_CLEAN, jh_clean, yes)
AC_CHECK_PROG(HAVE_FAKEROOT, fakeroot, yes)
AC_CHECK_PROG(HAVE_DPKG, dpkg, yes)

if test "${HAVE_RPMBUILD}" = "yes" -a "${HAVE_RPM}" = "yes"
then
    export RPM_POSSIBLE="yes"
fi
if test "${HAVE_DH_TESTDIR}" = "yes" -a "${HAVE_DH_PREP}" = "yes" \
    -a "${HAVE_JH_INSTALLLIBS}" = "yes" -a "${HAVE_JH_INSTALLJAVADOC}" = "yes" \
    -a "${HAVE_JH_DEPENDS}" = "yes" -a "${HAVE_DH_COMPRESS}" = "yes" \
    -a "${HAVE_DH_FIXPERMS}" = "yes" -a "${HAVE_DH_INSTALLDEB}" = "yes" \
    -a "${HAVE_DH_GENCONTROL}" = "yes" -a "${HAVE_DH_MD5SUMS}" = "yes" \
    -a "${HAVE_DH_BUILDDEB}" = "yes" -a "${HAVE_DH_CLEAN}" = "yes" \
    -a "${HAVE_JH_CLEAN}" = "yes" -a "${HAVE_FAKEROOT}" = "yes" \
    -a "${HAVE_DPKG}" = "yes"
then
    export DEB_POSSIBLE="yes"
fi
AC_MSG_NOTICE([Possible build types: ${POSSIBLE_BUILD_TYPES}])
AC_MSG_NOTICE([gnu])
if test -n "${RPM_POSSIBLE}"; then AC_MSG_NOTICE([rpm]); fi
if test -n "${DEB_POSSIBLE}"; then AC_MSG_NOTICE([deb]); fi

AC_SUBST([INSTALL_INFO], [am-fake])
if test -z "${BUILD_TYPE}" -o "${BUILD_TYPE}" = "gnu"
then
    AC_SUBST([BUILD_TYPE], [gnu])
else
    if test "${BUILD_TYPE}" = "rpm" -a -n "${RPM_POSSIBLE}"
    then
        export BUILD_POSSIBLE="yes"
    fi
    if test "${BUILD_TYPE}" = "deb" -a -n "${DEB_POSSIBLE}"
    then
        export BUILD_POSSIBLE="yes"
    fi
    if test -z "${BUILD_POSSIBLE}"
    then
        AC_MSG_ERROR([Requested build type (${BUILD_TYPE}) is not possible])
    fi
    AC_SUBST([INSTALL_INFO], [am])
fi
AC_MSG_NOTICE([${PACKAGE_NAME} will be built using ${BUILD_TYPE} format])

# Substitute common strings in RPM and DEB specification files
AC_SUBST([PACKAGE_SUMMARY], ["WebSocket protocol implementation in Java"])
AC_SUBST([PACKAGE_DESCRIPTION], ["GNU WebSocket4J is a WebSocket protocol implementation in Java. It allows you to build Web applications that interact with applications running in a JVM.  GNU WebSocket4J implements both server and client side of the protocol, so it can be used to build both WebSocket servers and clients."])
AC_SUBST([PACKAGE_DOWNLOAD_URL], [http://launchpad.net/websocket4j/trunk/v${PACKAGE_VERSION}/+download/${PACKAGE_TARNAME}-${PACKAGE_VERSION}.tar.gz])
AC_SUBST([PACKAGE_MAINTAINER], ["Marek Aaron Sapota <projects.gg.aaron@gmail.com>"])
AC_SUBST([CONFIGURE_TIME], [$(date -R)])

AC_OUTPUT
