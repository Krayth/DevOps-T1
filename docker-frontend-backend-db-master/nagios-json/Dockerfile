FROM jasonrivers/nagios:latest

ENV NAGIOS_TIMEZONE="america/sao_paulo"

RUN apt update
RUN apt install -y vim nano postfix mailutils libsasl2-2 ca-certificates libsasl2-modules

ADD testecfg/teste_virtual.cfg /opt/nagios/etc/objects/testecfg/

ADD nagios.cfg /opt/nagios/etc/

EXPOSE 2000