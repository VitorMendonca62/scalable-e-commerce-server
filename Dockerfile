FROM krakend 

WORKDIR /etc/krakend

ENV FC_ENABLE=1
ENV FC_PARTIALS=/etc/krakend/partials
ENV FC_SETTINGS=/etc/krakend/settings
ENV FC_TEMPLATES=/etc/krakend/templates

COPY config/krakend /etc/krakend

EXPOSE 8000

CMD [ "run", "-d", "-c", "/etc/krakend/krakend.tmpl" ]