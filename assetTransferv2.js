"use strict";

const { Contract } = require("fabric-contract-api");

class ProductsChaincode extends Contract {
  async InitializeDefaultOrders(ctx) {
    const utcDate = "2005-10-30 T 10:45UTC";
    const orders = [
      {
        ID: "123456",
        SVC_UN_NO: "654321",
        SO_NO: "656565",
        SVC_PRT_NO: "666666",
        Status: `Order received to SDLC parts [${utcDate}]`,
        PartName: "Compressor",
        Events: ["Order received to SDLC parts [2005-10-30 T 10:45UTC]"],
        ChainOfCustody: ["Vendor X", "UPS"],
        TimeStampPartOrdered: `${utcDate}`,
        EstimatedDeliveryDate: "NA",
        Source: "NA",
        AdditionalComments: "NA",
        TrackID: "NA",
        ContactCustodian: "NA",
        ContactVendor: "NA",
      },
      {
        ID: "123457",
        SVC_UN_NO: "754321",
        SO_NO: "575757",
        SVC_PRT_NO: "777777",
        Status: `Order received to SDLC parts [${utcDate}]`,
        PartName: "Washing Drum LG",
        Events: [
          "Order received to SDLC parts [2005-10-30 T 10:45UTC]",
        ],
        TimeStampPartOrdered: `${utcDate}`,
        EstimatedDeliveryDate: "NA",
        Source: "NA",
        AdditionalComments: "NA",
        TrackID: "NA",
        ContactCustodian: "NA",
        ContactVendor: "NA",
      },
      {
        ID: "123458",
        SVC_UN_NO: "854321",
        SO_NO: "85858585",
        SVC_PRT_NO: "8888888",
        Status: `Order received to SDLC parts [${utcDate}]`,
        PartName: "Fridge Door",
        Events: [
          "Order received to SDLC parts [2005-10-30 T 10:45UTC]",
        ],
        TimeStampPartOrdered: `${utcDate}`,
        EstimatedDeliveryDate: "NA",
        Source: "NA",
        AdditionalComments: "NA",
        TrackID: "NA",
        ContactCustodian: "NA",
        ContactVendor: "NA",
      },
    ];

    for (const order of orders) {
      order.docType = "order";
      await ctx.stub.putState(order.ID, Buffer.from(JSON.stringify(order)));
      console.info(`Order ${order.ID} initialized`);
    }
  }

  async CreateOrder(ctx, id, sv_un_no, so_no, svc_prt_no, partName) {
    const utcDate = "2005-10-30 T 10:45UTC";
    const newOrder = {
      ID: id,
      SVC_UN_NO: sv_un_no,
      SO_NO: so_no,
      SVC_PRT_NO: svc_prt_no,
      Status: `Order received to SDLC parts [${utcDate}]`,
      PartName: partName,
      Events: ["Order received to SDLC parts [2005-10-30 T 10:45UTC]"],
      ChainOfCustody: [],
      TimeStampPartOrdered: `${utcDate}`,
      EstimatedDeliveryDate: "NA",
      Source: "NA",
      AdditionalComments: "NA",
      TrackID: "NA",
      ContactCustodian: "NA",
      ContactVendor: "NA",
    };
    ctx.stub.putState(id, Buffer.from(JSON.stringify(newOrder)));
    return JSON.stringify(newOrder);
  }

  async OrderExists(ctx, id) {
    const orderJSON = await ctx.stub.getState(id);
    return orderJSON && orderJSON.length > 0;
  }

  async UpdateOrderStatus(ctx, id, status) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    order.Status = status;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async UpdateEstdDeliveryDate(ctx, id, date) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    order.EstimatedDeliveryDate = date;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async UpdateSource(ctx, id, source) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    order.Source = source;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async UpdateAdditionalComments(ctx, id, comment) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    order.AdditionalComments = comment;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async UpdateTrackID(ctx, id, trackID) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    order.TrackID = trackID;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async AddEvent(ctx, id, event) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    let copyChainOfEvents = order.Events;
    copyChainOfEvents.push(event);
    order.Events = copyChainOfEvents;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async UpdateChainOfCustody(ctx, id, newOwner) {
    const exists = await this.OrderExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    let copyChainOfCustody= order.ChainOfCustody;
    copyChainOfCustody.push(newOwner);
    order.ChainOfCustody = copyChainOfCustody;
    return ctx.stub.putState(id, Buffer.from(JSON.stringify(order)));
  }

  async GetCurrentOwner(ctx, id) {
    const orderString = await this.GetOrderDetails(ctx, id);
    const order = JSON.parse(orderString);
    const chainOfCustody = order.ChainOfCustody;
    const owner = chainOfCustody[chainOfCustody.length - 1];
    return owner;
  }

  async GetOrderDetails(ctx, id) {
    const orderJSON = await ctx.stub.getState(id);
    if (!orderJSON || orderJSON.length === 0) {
      throw new Error(`The order with Order ID: ${id} does not exist`);
    }
    return orderJSON.toString();
  }

  async GetEvents(ctx, id) {
    const orderStringJSON = await this.GetOrderDetails(ctx, id);
    const orderOBJ = JSON.parse(orderStringJSON);
    let copyChainOfEvents = orderOBJ.Events;
    return JSON.stringify(copyChainOfEvents);
  }

  async GetAllOrders(ctx) {
    const allResults = [];

    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push({ Key: result.value.key, Record: record });
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
}

module.exports = ProductsChaincode;
